from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.database import Base


class User(Base):
    """
    User model (for future authentication)
    Currently nullable in Reminder model - will be required in Phase 2
    """
    __tablename__ = "users"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # User Details
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    timezone = Column(String(50), default="UTC", nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    reminders = relationship("Reminder", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"
