from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.models.reminder import Reminder, ReminderStatus
from app.schemas.reminder import ReminderCreate, ReminderUpdate
from app.services.scheduler_service import scheduler
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)


class ReminderService:
    @staticmethod
    def get_reminders(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "scheduled_for",
        sort_order: str = "asc",
    ) -> tuple[List[Reminder], int]:
        query = db.query(Reminder)

        if status_filter and status_filter != "all":
            query = query.filter(Reminder.status == status_filter)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(Reminder.title.ilike(search_pattern), Reminder.message.ilike(search_pattern))
            )

        total = query.count()

        sort_column = getattr(Reminder, sort_by, Reminder.scheduled_for)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        reminders = query.offset(skip).limit(limit).all()

        return reminders, total

    @staticmethod
    def get_reminder_by_id(db: Session, reminder_id: UUID) -> Optional[Reminder]:
        return db.query(Reminder).filter(Reminder.id == reminder_id).first()

    @staticmethod
    def create_reminder(db: Session, reminder_data: ReminderCreate) -> Reminder:
        existing = (
            db.query(Reminder)
            .filter(
                Reminder.scheduled_for == reminder_data.scheduled_for,
                Reminder.status == ReminderStatus.SCHEDULED,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A reminder already exists for this exact time. Please choose a different time.",
            )

        db_reminder = Reminder(
            title=reminder_data.title,
            message=reminder_data.message,
            phone_number=reminder_data.phone_number,
            scheduled_for=reminder_data.scheduled_for,
            timezone=reminder_data.timezone,
            status=ReminderStatus.SCHEDULED,
            retry_count=0,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        db.add(db_reminder)
        db.commit()
        db.refresh(db_reminder)

        if scheduler.schedule_reminder(db_reminder):
            logger.info(f"Reminder {db_reminder.id} created and scheduled successfully")
        else:
            logger.error(f"Reminder {db_reminder.id} created but failed to schedule")

        return db_reminder

    @staticmethod
    def update_reminder(
        db: Session, reminder_id: UUID, reminder_data: ReminderUpdate
    ) -> Optional[Reminder]:
        db_reminder = ReminderService.get_reminder_by_id(db, reminder_id)

        if not db_reminder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

        if db_reminder.status != ReminderStatus.SCHEDULED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update reminder with status '{db_reminder.status}'. Only 'scheduled' reminders can be edited.",
            )

        if reminder_data.scheduled_for and reminder_data.scheduled_for != db_reminder.scheduled_for:
            existing = (
                db.query(Reminder)
                .filter(
                    Reminder.scheduled_for == reminder_data.scheduled_for,
                    Reminder.status == ReminderStatus.SCHEDULED,
                    Reminder.id != reminder_id,
                )
                .first()
            )

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A reminder already exists for this exact time. Please choose a different time.",
                )

        update_data = reminder_data.model_dump(exclude_unset=True)
        time_changed = "scheduled_for" in update_data

        for field, value in update_data.items():
            setattr(db_reminder, field, value)

        db_reminder.updated_at = datetime.now()

        db.commit()
        db.refresh(db_reminder)

        if time_changed:
            if scheduler.schedule_reminder(db_reminder):
                logger.info(f"Reminder {db_reminder.id} updated and rescheduled successfully")
            else:
                logger.error(f"Reminder {db_reminder.id} updated but failed to reschedule")

        return db_reminder

    @staticmethod
    def delete_reminder(db: Session, reminder_id: UUID) -> bool:
        db_reminder = ReminderService.get_reminder_by_id(db, reminder_id)

        if not db_reminder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

        if db_reminder.call_attempts:
            latest_attempt = db_reminder.call_attempts[-1]
            if latest_attempt.status in ["initiated", "ringing"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete reminder while call is in progress. Please wait for the call to complete.",
                )

        db.delete(db_reminder)
        db.commit()

        if scheduler.cancel_reminder(db_reminder.id):
            logger.info(f"Reminder {db_reminder.id} deleted and job cancelled successfully")
        else:
            logger.warning(f"Reminder {db_reminder.id} deleted but no scheduled job found")

        return True

    @staticmethod
    def retry_reminder(
        db: Session, reminder_id: UUID, new_scheduled_time: datetime
    ) -> Optional[Reminder]:
        db_reminder = ReminderService.get_reminder_by_id(db, reminder_id)

        if not db_reminder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

        if db_reminder.status != ReminderStatus.FAILED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot retry reminder with status '{db_reminder.status}'. Only 'failed' reminders can be retried.",
            )

        db_reminder.scheduled_for = new_scheduled_time
        db_reminder.status = ReminderStatus.SCHEDULED
        db_reminder.retry_count += 1
        db_reminder.updated_at = datetime.now()

        db.commit()
        db.refresh(db_reminder)

        if scheduler.schedule_reminder(db_reminder):
            logger.info(f"Reminder {db_reminder.id} retried and rescheduled successfully")
        else:
            logger.error(f"Reminder {db_reminder.id} retried but failed to reschedule")

        return db_reminder
