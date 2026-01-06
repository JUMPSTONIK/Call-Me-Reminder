from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.triggers.date import DateTrigger
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
import logging
import asyncio
from uuid import UUID

from app.core.config import settings
from app.db.database import SessionLocal
from app.models.reminder import Reminder, ReminderStatus, CallAttempt, CallAttemptStatus
from app.services.vapi_service import vapi_service

logger = logging.getLogger(__name__)


class ReminderScheduler:
    _instance: Optional["ReminderScheduler"] = None
    _scheduler: Optional[BackgroundScheduler] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._scheduler is None:
            jobstores = {"default": SQLAlchemyJobStore(url=settings.DATABASE_URL)}

            executors = {"default": ThreadPoolExecutor(10)}

            job_defaults = {"coalesce": False, "max_instances": 3, "misfire_grace_time": 60}

            self._scheduler = BackgroundScheduler(
                jobstores=jobstores, executors=executors, job_defaults=job_defaults, timezone="UTC"
            )

            logger.info("ReminderScheduler initialized with SQLAlchemy job store")

    def start(self):
        if self._scheduler and not self._scheduler.running:
            self._scheduler.start()
            logger.info("ReminderScheduler started")

    def shutdown(self):
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown(wait=True)
            logger.info("ReminderScheduler shutdown complete")

    def schedule_reminder(self, reminder: Reminder) -> bool:
        try:
            job_id = f"reminder_{reminder.id}"

            if self._scheduler.get_job(job_id):
                self._scheduler.remove_job(job_id)
                logger.info(f"Removed existing job for reminder {reminder.id}")

            self._scheduler.add_job(
                func=execute_reminder,
                trigger=DateTrigger(run_date=reminder.scheduled_for),
                args=[str(reminder.id)],
                id=job_id,
                name=f"Reminder: {reminder.title}",
                replace_existing=True,
            )

            logger.info(
                f"Scheduled reminder {reminder.id} - '{reminder.title}' "
                f"for {reminder.scheduled_for.isoformat()}"
            )

            return True

        except Exception as e:
            logger.error(f"Failed to schedule reminder {reminder.id}: {str(e)}")
            return False

    def cancel_reminder(self, reminder_id: UUID) -> bool:
        try:
            job_id = f"reminder_{reminder_id}"

            if self._scheduler.get_job(job_id):
                self._scheduler.remove_job(job_id)
                logger.info(f"Cancelled scheduled job for reminder {reminder_id}")
                return True
            else:
                logger.warning(f"No scheduled job found for reminder {reminder_id}")
                return False

        except Exception as e:
            logger.error(f"Failed to cancel reminder {reminder_id}: {str(e)}")
            return False

    def reschedule_all_pending(self):
        db = SessionLocal()
        try:
            pending_reminders = (
                db.query(Reminder)
                .filter(
                    Reminder.status == ReminderStatus.SCHEDULED,
                    Reminder.scheduled_for > datetime.now(timezone.utc),
                )
                .all()
            )

            scheduled_count = 0
            for reminder in pending_reminders:
                if self.schedule_reminder(reminder):
                    scheduled_count += 1

            logger.info(
                f"Rescheduled {scheduled_count} out of {len(pending_reminders)} "
                f"pending reminders on startup"
            )

        except Exception as e:
            logger.error(f"Failed to reschedule pending reminders: {str(e)}")
        finally:
            db.close()

    def get_scheduled_jobs(self):
        if self._scheduler:
            return self._scheduler.get_jobs()
        return []


scheduler = ReminderScheduler()


def execute_reminder(reminder_id: str):
    db = SessionLocal()
    try:
        reminder = db.query(Reminder).filter(Reminder.id == UUID(reminder_id)).first()

        if not reminder:
            logger.error(f"Reminder {reminder_id} not found during execution")
            return

        if reminder.status != ReminderStatus.SCHEDULED:
            logger.warning(
                f"Reminder {reminder_id} has status '{reminder.status}', skipping execution"
            )
            return

        logger.info(f"Executing reminder {reminder_id} - '{reminder.title}'")

        existing_attempts = len(reminder.call_attempts) if reminder.call_attempts else 0
        attempt_number = existing_attempts + 1

        call_attempt = CallAttempt(
            reminder_id=reminder.id,
            attempt_number=attempt_number,
            status=CallAttemptStatus.INITIATED,
            initiated_at=datetime.now(timezone.utc),
        )

        db.add(call_attempt)
        db.commit()
        db.refresh(call_attempt)

        logger.info(
            f"Call attempt {call_attempt.id} created for reminder {reminder_id}. "
            f"Triggering Vapi call to {reminder.phone_number}"
        )

        success, vapi_call_id, error_message = asyncio.run(
            vapi_service.trigger_call(reminder, call_attempt.id)
        )

        if success and vapi_call_id:
            call_attempt.vapi_call_id = vapi_call_id
            call_attempt.status = CallAttemptStatus.RINGING
            reminder.vapi_call_id = vapi_call_id
            reminder.last_attempt_at = datetime.now(timezone.utc)
            reminder.updated_at = datetime.now(timezone.utc)

            db.commit()

            logger.info(
                f"Vapi call initiated successfully for reminder {reminder_id}. "
                f"Vapi Call ID: {vapi_call_id}. "
                f"Call status will be updated via webhook."
            )

        else:
            call_attempt.status = CallAttemptStatus.FAILED
            call_attempt.failure_reason = error_message or "Failed to initiate Vapi call"
            call_attempt.completed_at = datetime.now(timezone.utc)

            reminder.status = ReminderStatus.FAILED
            reminder.failure_reason = error_message
            reminder.last_attempt_at = datetime.now(timezone.utc)
            reminder.updated_at = datetime.now(timezone.utc)

            db.commit()

            logger.error(f"Failed to trigger Vapi call for reminder {reminder_id}: {error_message}")

    except Exception as e:
        logger.error(f"Failed to execute reminder {reminder_id}: {str(e)}")

        try:
            reminder = db.query(Reminder).filter(Reminder.id == UUID(reminder_id)).first()

            if reminder:
                reminder.status = ReminderStatus.FAILED
                reminder.last_attempt_at = datetime.now(timezone.utc)
                reminder.updated_at = datetime.now(timezone.utc)
                db.commit()

                logger.info(f"Marked reminder {reminder_id} as failed")

        except Exception as nested_error:
            logger.error(f"Failed to mark reminder {reminder_id} as failed: {str(nested_error)}")

    finally:
        db.close()
