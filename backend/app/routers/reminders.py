from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import math

from app.db.database import get_db
from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderRetry,
    ReminderResponse,
    ReminderListResponse,
    ReminderListItem,
)
from app.services.reminder_service import ReminderService

router = APIRouter()


@router.get("/", response_model=ReminderListResponse)
def list_reminders(
    status: Optional[str] = Query(
        None, description="Filter by status: all, scheduled, completed, failed"
    ),
    search: Optional[str] = Query(None, description="Search in title and message"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("scheduled_for", description="Sort by field: scheduled_for, created_at"),
    sort_order: str = Query("asc", description="Sort order: asc, desc"),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * per_page

    reminders, total = ReminderService.get_reminders(
        db=db,
        skip=skip,
        limit=per_page,
        status_filter=status,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    total_pages = math.ceil(total / per_page) if total > 0 else 0

    reminder_items = []
    for reminder in reminders:
        reminder_dict = ReminderListItem.model_validate(reminder).model_dump()
        reminder_dict["call_attempts_count"] = len(reminder.call_attempts)
        reminder_items.append(ReminderListItem(**reminder_dict))

    return ReminderListResponse(
        reminders=reminder_items, total=total, page=page, per_page=per_page, total_pages=total_pages
    )


@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(reminder_id: UUID, db: Session = Depends(get_db)):
    reminder = ReminderService.get_reminder_by_id(db, reminder_id)

    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    return reminder


@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    return ReminderService.create_reminder(db, reminder)


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(reminder_id: UUID, reminder: ReminderUpdate, db: Session = Depends(get_db)):
    return ReminderService.update_reminder(db, reminder_id, reminder)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: UUID, db: Session = Depends(get_db)):
    ReminderService.delete_reminder(db, reminder_id)
    return None


@router.post("/{reminder_id}/retry", response_model=ReminderResponse)
def retry_reminder(reminder_id: UUID, retry_data: ReminderRetry, db: Session = Depends(get_db)):
    return ReminderService.retry_reminder(db, reminder_id, retry_data.scheduled_for)
