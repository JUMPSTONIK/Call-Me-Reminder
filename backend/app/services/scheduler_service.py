from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.triggers.date import DateTrigger
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
import logging
from uuid import UUID

from app.core.config import settings
from app.db.database import SessionLocal
from app.models.reminder import Reminder, ReminderStatus, CallAttempt, CallAttemptStatus

logger = logging.getLogger(__name__)


class ReminderScheduler:
    """
    Singleton scheduler for managing reminder execution.
    Uses APScheduler with SQLAlchemy job store for persistence.
    """

    _instance: Optional['ReminderScheduler'] = None
    _scheduler: Optional[BackgroundScheduler] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize scheduler with SQLAlchemy job store"""
        if self._scheduler is None:
            jobstores = {
                'default': SQLAlchemyJobStore(url=settings.DATABASE_URL)
            }

            executors = {
                'default': ThreadPoolExecutor(10)
            }

            job_defaults = {
                'coalesce': False,  # Run all missed jobs
                'max_instances': 3,  # Allow up to 3 instances of same job
                'misfire_grace_time': 60  # Allow 60 seconds grace period
            }

            self._scheduler = BackgroundScheduler(
                jobstores=jobstores,
                executors=executors,
                job_defaults=job_defaults,
                timezone='UTC'
            )

            logger.info("ReminderScheduler initialized with SQLAlchemy job store")

    def start(self):
        """Start the scheduler"""
        if self._scheduler and not self._scheduler.running:
            self._scheduler.start()
            logger.info("ReminderScheduler started")

    def shutdown(self):
        """Shutdown the scheduler gracefully"""
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown(wait=True)
            logger.info("ReminderScheduler shutdown complete")

    def schedule_reminder(self, reminder: Reminder) -> bool:
        """
        Schedule a reminder for execution at its scheduled time.

        Args:
            reminder: The Reminder object to schedule

        Returns:
            bool: True if successfully scheduled, False otherwise
        """
        try:
            job_id = f"reminder_{reminder.id}"

            # Remove existing job if it exists
            if self._scheduler.get_job(job_id):
                self._scheduler.remove_job(job_id)
                logger.info(f"Removed existing job for reminder {reminder.id}")

            # Schedule the reminder
            self._scheduler.add_job(
                func=execute_reminder,
                trigger=DateTrigger(run_date=reminder.scheduled_for),
                args=[str(reminder.id)],
                id=job_id,
                name=f"Reminder: {reminder.title}",
                replace_existing=True
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
        """
        Cancel a scheduled reminder job.

        Args:
            reminder_id: UUID of the reminder to cancel

        Returns:
            bool: True if successfully cancelled, False otherwise
        """
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
        """
        Reschedule all pending reminders.
        This should be called on server startup to restore scheduled jobs.
        """
        db = SessionLocal()
        try:
            # Get all scheduled reminders that haven't been executed yet
            pending_reminders = db.query(Reminder).filter(
                Reminder.status == ReminderStatus.SCHEDULED,
                Reminder.scheduled_for > datetime.now(timezone.utc)
            ).all()

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
        """Get all currently scheduled jobs for debugging"""
        if self._scheduler:
            return self._scheduler.get_jobs()
        return []


# Global scheduler instance
scheduler = ReminderScheduler()


def execute_reminder(reminder_id: str):
    """
    Execute a reminder when its scheduled time arrives.
    This function is called by APScheduler.

    Args:
        reminder_id: UUID string of the reminder to execute
    """
    db = SessionLocal()
    try:
        # Get the reminder
        reminder = db.query(Reminder).filter(
            Reminder.id == UUID(reminder_id)
        ).first()

        if not reminder:
            logger.error(f"Reminder {reminder_id} not found during execution")
            return

        # Check if reminder is still scheduled
        if reminder.status != ReminderStatus.SCHEDULED:
            logger.warning(
                f"Reminder {reminder_id} has status '{reminder.status}', skipping execution"
            )
            return

        logger.info(f"Executing reminder {reminder_id} - '{reminder.title}'")

        # Calculate attempt number (count existing attempts + 1)
        existing_attempts = len(reminder.call_attempts) if reminder.call_attempts else 0
        attempt_number = existing_attempts + 1

        # Create a call attempt record
        call_attempt = CallAttempt(
            reminder_id=reminder.id,
            attempt_number=attempt_number,
            status=CallAttemptStatus.INITIATED,
            initiated_at=datetime.now(timezone.utc)
        )

        db.add(call_attempt)
        db.commit()
        db.refresh(call_attempt)

        # TODO: In Phase 5, this is where we'll trigger the Vapi call
        # For now, we'll simulate the call process
        logger.info(
            f"Call attempt {call_attempt.id} created for reminder {reminder_id}. "
            f"Calling {reminder.phone_number} with message: {reminder.message}"
        )

        # Simulate successful call (will be replaced with real Vapi integration)
        call_attempt.status = CallAttemptStatus.COMPLETED
        call_attempt.completed_at = datetime.now(timezone.utc)
        call_attempt.duration_seconds = 0  # Will be updated by Vapi webhook

        # Mark reminder as completed
        reminder.status = ReminderStatus.COMPLETED
        reminder.last_attempt_at = datetime.now(timezone.utc)
        reminder.updated_at = datetime.now(timezone.utc)

        db.commit()

        logger.info(
            f"Reminder {reminder_id} executed successfully. "
            f"Call attempt {call_attempt.id} completed."
        )

    except Exception as e:
        logger.error(f"Failed to execute reminder {reminder_id}: {str(e)}")

        # Try to mark the reminder as failed
        try:
            reminder = db.query(Reminder).filter(
                Reminder.id == UUID(reminder_id)
            ).first()

            if reminder:
                reminder.status = ReminderStatus.FAILED
                reminder.last_attempt_at = datetime.now(timezone.utc)
                reminder.updated_at = datetime.now(timezone.utc)
                db.commit()

                logger.info(f"Marked reminder {reminder_id} as failed")

        except Exception as nested_error:
            logger.error(
                f"Failed to mark reminder {reminder_id} as failed: {str(nested_error)}"
            )

    finally:
        db.close()
