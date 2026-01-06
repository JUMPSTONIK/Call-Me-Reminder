import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta, timezone

from app.main import app
from app.db.database import Base, get_db
from app.models.reminder import Reminder, ReminderStatus

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_reminder_data():
    scheduled_time = datetime.now(timezone.utc) + timedelta(hours=1)
    return {
        "title": "Test Reminder",
        "message": "This is a test message for the reminder",
        "phone_number": "+15551234567",
        "scheduled_for": scheduled_time.isoformat(),
        "timezone": "America/New_York",
    }


@pytest.fixture
def create_reminder(db_session):
    def _create_reminder(**kwargs):
        defaults = {
            "title": "Test Reminder",
            "message": "Test message",
            "phone_number": "+15551234567",
            "scheduled_for": datetime.now(timezone.utc) + timedelta(hours=1),
            "timezone": "UTC",
            "status": ReminderStatus.SCHEDULED,
        }
        defaults.update(kwargs)
        reminder = Reminder(**defaults)
        db_session.add(reminder)
        db_session.commit()
        db_session.refresh(reminder)
        return reminder

    return _create_reminder
