import pytest
from datetime import datetime, timedelta, timezone


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
