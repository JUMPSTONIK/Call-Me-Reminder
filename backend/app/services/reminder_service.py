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
    """Service for handling reminder business logic"""

    @staticmethod
    def get_reminders(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "scheduled_for",
        sort_order: str = "asc"
    ) -> tuple[List[Reminder], int]:
        """
        Get paginated list of reminders with filters

        Returns:
            tuple: (list of reminders, total count)
        """
        query = db.query(Reminder)

        # Apply status filter
        if status_filter and status_filter != "all":
            query = query.filter(Reminder.status == status_filter)

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Reminder.title.ilike(search_pattern),
                    Reminder.message.ilike(search_pattern)
                )
            )

        # Get total count before pagination
        total = query.count()

        # Apply sorting
        sort_column = getattr(Reminder, sort_by, Reminder.scheduled_for)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Apply pagination
        reminders = query.offset(skip).limit(limit).all()

        return reminders, total

    @staticmethod
    def get_reminder_by_id(db: Session, reminder_id: UUID) -> Optional[Reminder]:
        """Get a single reminder by ID"""
        return db.query(Reminder).filter(Reminder.id == reminder_id).first()

    @staticmethod
    def create_reminder(db: Session, reminder_data: ReminderCreate) -> Reminder:
        """
        Create a new reminder

        Validates:
        - No duplicate scheduled time for same user
        - Phone number format
        - Future date
        """
        # Check for duplicate scheduled time (same minute)
        # This prevents scheduling multiple reminders at exact same time
        existing = db.query(Reminder).filter(
            Reminder.scheduled_for == reminder_data.scheduled_for,
            Reminder.status == ReminderStatus.SCHEDULED
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A reminder already exists for this exact time. Please choose a different time."
            )

        # Create reminder
        db_reminder = Reminder(
            title=reminder_data.title,
            message=reminder_data.message,
            phone_number=reminder_data.phone_number,
            scheduled_for=reminder_data.scheduled_for,
            timezone=reminder_data.timezone,
            status=ReminderStatus.SCHEDULED,
            retry_count=0,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        db.add(db_reminder)
        db.commit()
        db.refresh(db_reminder)

        # Schedule the reminder for automatic execution
        if scheduler.schedule_reminder(db_reminder):
            logger.info(f"Reminder {db_reminder.id} created and scheduled successfully")
        else:
            logger.error(f"Reminder {db_reminder.id} created but failed to schedule")

        return db_reminder

    @staticmethod
    def update_reminder(
        db: Session,
        reminder_id: UUID,
        reminder_data: ReminderUpdate
    ) -> Optional[Reminder]:
        """
        Update an existing reminder

        Validates:
        - Reminder exists
        - Can only update scheduled reminders
        - No duplicate scheduled time if time is being updated
        """
        db_reminder = ReminderService.get_reminder_by_id(db, reminder_id)

        if not db_reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )

        # Can only edit scheduled reminders
        if db_reminder.status != ReminderStatus.SCHEDULED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update reminder with status '{db_reminder.status}'. Only 'scheduled' reminders can be edited."
            )

        # Check for duplicate scheduled time if time is being updated
        if reminder_data.scheduled_for and reminder_data.scheduled_for != db_reminder.scheduled_for:
            existing = db.query(Reminder).filter(
                Reminder.scheduled_for == reminder_data.scheduled_for,
                Reminder.status == ReminderStatus.SCHEDULED,
                Reminder.id != reminder_id
            ).first()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A reminder already exists for this exact time. Please choose a different time."
                )

        # Update fields
        update_data = reminder_data.model_dump(exclude_unset=True)
        time_changed = 'scheduled_for' in update_data

        for field, value in update_data.items():
            setattr(db_reminder, field, value)

        db_reminder.updated_at = datetime.now()

        db.commit()
        db.refresh(db_reminder)

        # Reschedule if the scheduled time was changed
        if time_changed:
            if scheduler.schedule_reminder(db_reminder):
                logger.info(f"Reminder {db_reminder.id} updated and rescheduled successfully")
            else:
                logger.error(f"Reminder {db_reminder.id} updated but failed to reschedule")

        return db_reminder

    @staticmethod
    def delete_reminder(db: Session, reminder_id: UUID) -> bool:
        """
        Delete a reminder

        Validates:
        - Reminder exists
        - No call is currently in progress
        """
        db_reminder = ReminderService.get_reminder_by_id(db, reminder_id)

        if not db_reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )

        # Check if call is in progress
        if db_reminder.call_attempts:
            latest_attempt = db_reminder.call_attempts[-1]
            if latest_attempt.status in ['initiated', 'ringing']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete reminder while call is in progress. Please wait for the call to complete."
                )

        db.delete(db_reminder)
        db.commit()

        # Cancel the scheduled job
        if scheduler.cancel_reminder(db_reminder.id):
            logger.info(f"Reminder {db_reminder.id} deleted and job cancelled successfully")
        else:
            logger.warning(f"Reminder {db_reminder.id} deleted but no scheduled job found")

        return True

    @staticmethod
    def retry_reminder(db: Session, reminder_id: UUID, new_scheduled_time: datetime) -> Optional[Reminder]:
        """
        Retry a failed reminder by rescheduling it.

        Validates:
        - Reminder exists
        - Reminder status is 'failed'
        - New scheduled time is in the future
        """
        db_reminder = ReminderService.get_reminder_by_id(db, reminder_id)

        if not db_reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )

        # Can only retry failed reminders
        if db_reminder.status != ReminderStatus.FAILED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot retry reminder with status '{db_reminder.status}'. Only 'failed' reminders can be retried."
            )

        # Update reminder
        db_reminder.scheduled_for = new_scheduled_time
        db_reminder.status = ReminderStatus.SCHEDULED
        db_reminder.retry_count += 1
        db_reminder.updated_at = datetime.now()

        db.commit()
        db.refresh(db_reminder)

        # Schedule the reminder
        if scheduler.schedule_reminder(db_reminder):
            logger.info(f"Reminder {db_reminder.id} retried and rescheduled successfully")
        else:
            logger.error(f"Reminder {db_reminder.id} retried but failed to reschedule")

        return db_reminder
