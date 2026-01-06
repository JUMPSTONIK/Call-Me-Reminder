from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.db.database import Base


class ReminderStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    FAILED = "failed"


class CallAttemptStatus(str, enum.Enum):
    INITIATED = "initiated"
    RINGING = "ringing"
    ANSWERED = "answered"
    COMPLETED = "completed"
    FAILED = "failed"
    NO_ANSWER = "no_answer"


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)

    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    phone_number = Column(String(20), nullable=False)

    scheduled_for = Column(DateTime(timezone=True), nullable=False, index=True)
    timezone = Column(String(50), nullable=False)

    status = Column(
        SQLEnum(ReminderStatus), default=ReminderStatus.SCHEDULED, nullable=False, index=True
    )
    vapi_call_id = Column(String(100), nullable=True)
    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)

    call_attempts = relationship(
        "CallAttempt", back_populates="reminder", cascade="all, delete-orphan"
    )
    user = relationship("User", back_populates="reminders")

    __table_args__ = (
        Index("idx_reminders_scheduled", "scheduled_for", "status"),
        Index("idx_reminders_status", "status"),
        Index("idx_reminders_user", "user_id"),
    )

    def __repr__(self):
        return f"<Reminder(id={self.id}, title='{self.title}', status='{self.status}')>"


class CallAttempt(Base):
    __tablename__ = "call_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reminder_id = Column(
        UUID(as_uuid=True),
        ForeignKey("reminders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    attempt_number = Column(Integer, nullable=False)
    status = Column(SQLEnum(CallAttemptStatus), nullable=False)
    vapi_call_id = Column(String(100), nullable=True)

    duration_seconds = Column(Integer, nullable=True)
    failure_reason = Column(Text, nullable=True)

    initiated_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    reminder = relationship("Reminder", back_populates="call_attempts")

    __table_args__ = (Index("idx_call_attempts_reminder", "reminder_id"),)

    def __repr__(self):
        return f"<CallAttempt(id={self.id}, reminder_id={self.reminder_id}, attempt={self.attempt_number}, status='{self.status}')>"
