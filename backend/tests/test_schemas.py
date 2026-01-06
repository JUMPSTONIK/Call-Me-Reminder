import pytest
from datetime import datetime, timedelta, timezone
from pydantic import ValidationError

from app.schemas.reminder import ReminderCreate, ReminderUpdate


class TestReminderCreate:
    def test_valid_reminder_creation(self):
        scheduled_time = datetime.now(timezone.utc) + timedelta(hours=1)
        data = {
            "title": "Test Reminder",
            "message": "This is a test message",
            "phone_number": "+15551234567",
            "scheduled_for": scheduled_time,
            "timezone": "America/New_York",
        }
        reminder = ReminderCreate(**data)
        assert reminder.title == "Test Reminder"
        assert reminder.phone_number == "+15551234567"

    def test_title_too_short(self):
        scheduled_time = datetime.now(timezone.utc) + timedelta(hours=1)
        data = {
            "title": "AB",
            "message": "This is a test message",
            "phone_number": "+15551234567",
            "scheduled_for": scheduled_time,
            "timezone": "UTC",
        }
        with pytest.raises(ValidationError) as exc_info:
            ReminderCreate(**data)
        assert "at least 3 characters" in str(exc_info.value)

    def test_title_too_long(self):
        scheduled_time = datetime.now(timezone.utc) + timedelta(hours=1)
        data = {
            "title": "A" * 101,
            "message": "This is a test message",
            "phone_number": "+15551234567",
            "scheduled_for": scheduled_time,
            "timezone": "UTC",
        }
        with pytest.raises(ValidationError) as exc_info:
            ReminderCreate(**data)
        assert "100 characters" in str(exc_info.value)

    def test_message_too_short(self):
        scheduled_time = datetime.now(timezone.utc) + timedelta(hours=1)
        data = {
            "title": "Test",
            "message": "Short",
            "phone_number": "+15551234567",
            "scheduled_for": scheduled_time,
            "timezone": "UTC",
        }
        with pytest.raises(ValidationError) as exc_info:
            ReminderCreate(**data)
        assert "at least 10 characters" in str(exc_info.value)

    def test_invalid_phone_number_format(self):
        scheduled_time = datetime.now(timezone.utc) + timedelta(hours=1)
        data = {
            "title": "Test Reminder",
            "message": "This is a test message",
            "phone_number": "1234567890",
            "scheduled_for": scheduled_time,
            "timezone": "UTC",
        }
        with pytest.raises(ValidationError) as exc_info:
            ReminderCreate(**data)
        assert "E.164 format" in str(exc_info.value)

    def test_scheduled_time_in_past(self):
        past_time = datetime.now(timezone.utc) - timedelta(hours=1)
        data = {
            "title": "Test Reminder",
            "message": "This is a test message",
            "phone_number": "+15551234567",
            "scheduled_for": past_time,
            "timezone": "UTC",
        }
        with pytest.raises(ValidationError) as exc_info:
            ReminderCreate(**data)
        assert "must be in the future" in str(exc_info.value)

    def test_scheduled_time_too_far_future(self):
        far_future = datetime.now(timezone.utc) + timedelta(days=366)
        data = {
            "title": "Test Reminder",
            "message": "This is a test message",
            "phone_number": "+15551234567",
            "scheduled_for": far_future,
            "timezone": "UTC",
        }
        with pytest.raises(ValidationError) as exc_info:
            ReminderCreate(**data)
        assert "within 1 year" in str(exc_info.value)


class TestReminderUpdate:
    def test_partial_update(self):
        data = {"title": "Updated Title"}
        reminder = ReminderUpdate(**data)
        assert reminder.title == "Updated Title"
        assert reminder.message is None

    def test_update_with_invalid_title(self):
        data = {"title": "AB"}
        with pytest.raises(ValidationError) as exc_info:
            ReminderUpdate(**data)
        assert "at least 3 characters" in str(exc_info.value)
