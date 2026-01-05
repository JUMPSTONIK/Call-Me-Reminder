from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.db.database import Base


class ReminderStatus(str, enum.Enum):
    """Reminder status enumeration"""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    FAILED = "failed"


class CallAttemptStatus(str, enum.Enum):
    """Call attempt status enumeration"""
    INITIATED = "initiated"
    RINGING = "ringing"
    ANSWERED = "answered"
    COMPLETED = "completed"
    FAILED = "failed"
    NO_ANSWER = "no_answer"


class Reminder(Base):
    """
    Main Reminder model
    Stores information about scheduled phone call reminders
    """
    __tablename__ = "reminders"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # User (nullable for MVP, required later)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)

    # Reminder Details
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    phone_number = Column(String(20), nullable=False)

    # Scheduling
    scheduled_for = Column(DateTime(timezone=True), nullable=False, index=True)
    timezone = Column(String(50), nullable=False)  # IANA timezone (e.g., "America/Guatemala")

    # Status & Tracking
    status = Column(SQLEnum(ReminderStatus), default=ReminderStatus.SCHEDULED, nullable=False, index=True)
    vapi_call_id = Column(String(100), nullable=True)
    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    call_attempts = relationship("CallAttempt", back_populates="reminder", cascade="all, delete-orphan")
    user = relationship("User", back_populates="reminders")

    # Indexes
    __table_args__ = (
        Index('idx_reminders_scheduled', 'scheduled_for', 'status'),
        Index('idx_reminders_status', 'status'),
        Index('idx_reminders_user', 'user_id'),
    )

    def __repr__(self):
        return f"<Reminder(id={self.id}, title='{self.title}', status='{self.status}')>"


class CallAttempt(Base):
    """
    Activity Log for Call Attempts
    Tracks each attempt to make a phone call for a reminder
    """
    __tablename__ = "call_attempts"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Key
    reminder_id = Column(UUID(as_uuid=True), ForeignKey("reminders.id", ondelete="CASCADE"), nullable=False, index=True)

    # Attempt Details
    attempt_number = Column(Integer, nullable=False)
    status = Column(SQLEnum(CallAttemptStatus), nullable=False)
    vapi_call_id = Column(String(100), nullable=True)

    # Call Metrics
    duration_seconds = Column(Integer, nullable=True)
    failure_reason = Column(Text, nullable=True)

    # Timestamps
    initiated_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    reminder = relationship("Reminder", back_populates="call_attempts")

    # Indexes
    __table_args__ = (
        Index('idx_call_attempts_reminder', 'reminder_id'),
    )

    def __repr__(self):
        return f"<CallAttempt(id={self.id}, reminder_id={self.reminder_id}, attempt={self.attempt_number}, status='{self.status}')>"
