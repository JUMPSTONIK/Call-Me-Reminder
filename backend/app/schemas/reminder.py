from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional, List
from uuid import UUID
import phonenumbers
import pytz
from app.models.reminder import ReminderStatus, CallAttemptStatus


# Base Reminder Schema
class ReminderBase(BaseModel):
    """Base schema for Reminder with common fields"""
    title: str = Field(..., min_length=3, max_length=100, description="Reminder title")
    message: str = Field(..., min_length=10, max_length=500, description="Message to be spoken during call")
    phone_number: str = Field(..., max_length=20, description="Phone number in E.164 format")
    scheduled_for: datetime = Field(..., description="When to trigger the reminder (UTC)")
    timezone: str = Field(..., max_length=50, description="IANA timezone (e.g., America/Guatemala)")

    @field_validator('title', 'message')
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        """Strip whitespace from title and message"""
        return v.strip()

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Validate and normalize phone number to E.164 format"""
        try:
            parsed = phonenumbers.parse(v, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number")
            # Normalize to E.164
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException:
            raise ValueError("Phone number must be in E.164 format (e.g., +15551234567)")

    @field_validator('timezone')
    @classmethod
    def validate_timezone(cls, v: str) -> str:
        """Validate timezone against IANA database"""
        if v not in pytz.all_timezones:
            raise ValueError(f"Invalid timezone: {v}. Must be a valid IANA timezone.")
        return v

    @field_validator('scheduled_for')
    @classmethod
    def validate_future_date(cls, v: datetime) -> datetime:
        """Ensure reminder is at least 30 seconds in the future"""
        from datetime import timedelta, timezone

        now = datetime.now(timezone.utc)
        min_time = now + timedelta(seconds=30)

        # Ensure datetime is timezone-aware
        if v.tzinfo is None:
            raise ValueError("scheduled_for must include timezone information")

        # Convert to UTC for comparison
        v_utc = v.astimezone(timezone.utc)

        if v_utc <= min_time:
            raise ValueError("Reminder must be scheduled at least 30 seconds in the future")

        max_time = now + timedelta(days=365)
        if v_utc > max_time:
            raise ValueError("Reminder cannot be scheduled more than 1 year in advance")

        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Call Mom on her birthday",
                "message": "Hey Mom! Just wanted to wish you a happy birthday!",
                "phone_number": "+15551234567",
                "scheduled_for": "2026-01-15T10:00:00Z",
                "timezone": "America/Guatemala"
            }
        }
    )


# Create Schema
class ReminderCreate(ReminderBase):
    """Schema for creating a new reminder"""
    pass


# Update Schema
class ReminderUpdate(BaseModel):
    """Schema for updating an existing reminder"""
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    message: Optional[str] = Field(None, min_length=10, max_length=500)
    phone_number: Optional[str] = Field(None, max_length=20)
    scheduled_for: Optional[datetime] = None
    timezone: Optional[str] = Field(None, max_length=50)

    @field_validator('title', 'message')
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        """Strip whitespace from title and message"""
        return v.strip() if v else v

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v: Optional[str]) -> Optional[str]:
        """Validate and normalize phone number to E.164 format"""
        if v is None:
            return v
        try:
            parsed = phonenumbers.parse(v, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number")
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException:
            raise ValueError("Phone number must be in E.164 format (e.g., +15551234567)")

    @field_validator('timezone')
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        """Validate timezone against IANA database"""
        if v is None:
            return v
        if v not in pytz.all_timezones:
            raise ValueError(f"Invalid timezone: {v}. Must be a valid IANA timezone.")
        return v

    @field_validator('scheduled_for')
    @classmethod
    def validate_future_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Ensure reminder is at least 30 seconds in the future"""
        if v is None:
            return v

        from datetime import timedelta, timezone

        now = datetime.now(timezone.utc)
        min_time = now + timedelta(seconds=30)

        if v.tzinfo is None:
            raise ValueError("scheduled_for must include timezone information")

        v_utc = v.astimezone(timezone.utc)

        if v_utc <= min_time:
            raise ValueError("Reminder must be scheduled at least 30 seconds in the future")

        max_time = now + timedelta(days=365)
        if v_utc > max_time:
            raise ValueError("Reminder cannot be scheduled more than 1 year in advance")

        return v


# Retry Schema
class ReminderRetry(BaseModel):
    """Schema for retrying a failed reminder"""
    scheduled_for: datetime = Field(..., description="New scheduled time for the reminder")

    @field_validator('scheduled_for')
    @classmethod
    def validate_future_date(cls, v: datetime) -> datetime:
        """Ensure reminder is at least 30 seconds in the future"""
        from datetime import timedelta, timezone

        now = datetime.now(timezone.utc)
        min_time = now + timedelta(seconds=30)

        if v.tzinfo is None:
            raise ValueError("scheduled_for must include timezone information")

        v_utc = v.astimezone(timezone.utc)

        if v_utc <= min_time:
            raise ValueError("Reminder must be scheduled at least 30 seconds in the future")

        max_time = now + timedelta(days=365)
        if v_utc > max_time:
            raise ValueError("Reminder cannot be scheduled more than 1 year in advance")

        return v


# Call Attempt Schema
class CallAttemptResponse(BaseModel):
    """Schema for call attempt response"""
    id: UUID
    attempt_number: int
    status: CallAttemptStatus
    vapi_call_id: Optional[str] = None
    duration_seconds: Optional[int] = None
    failure_reason: Optional[str] = None
    initiated_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Response Schema
class ReminderResponse(BaseModel):
    """Schema for reminder response"""
    id: UUID
    user_id: Optional[UUID] = None
    title: str
    message: str
    phone_number: str
    scheduled_for: datetime
    timezone: str
    status: ReminderStatus
    vapi_call_id: Optional[str] = None
    failure_reason: Optional[str] = None
    retry_count: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    call_attempts: List[CallAttemptResponse] = []

    model_config = ConfigDict(from_attributes=True)


# List Response Schema
class ReminderListResponse(BaseModel):
    """Schema for paginated list of reminders"""
    reminders: List[ReminderResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# Simplified response for list views (without call_attempts)
class ReminderListItem(BaseModel):
    """Simplified schema for reminder list items"""
    id: UUID
    title: str
    message: str
    phone_number: str
    scheduled_for: datetime
    timezone: str
    status: ReminderStatus
    retry_count: int
    created_at: datetime
    updated_at: datetime
    call_attempts_count: int = 0

    model_config = ConfigDict(from_attributes=True)
