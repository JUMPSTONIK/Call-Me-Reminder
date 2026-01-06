import pytest
from datetime import datetime, timedelta, timezone


class TestReminderAPI:
    def test_create_reminder(self, client, sample_reminder_data):
        response = client.post("/api/reminders/", json=sample_reminder_data)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_reminder_data["title"]
        assert data["phone_number"] == sample_reminder_data["phone_number"]
        assert data["status"] == "scheduled"
        assert "id" in data

    def test_create_reminder_invalid_phone(self, client, sample_reminder_data):
        sample_reminder_data["phone_number"] = "1234567890"
        response = client.post("/api/reminders/", json=sample_reminder_data)
        assert response.status_code == 422

    def test_create_reminder_past_time(self, client, sample_reminder_data):
        past_time = datetime.now(timezone.utc) - timedelta(hours=1)
        sample_reminder_data["scheduled_for"] = past_time.isoformat()
        response = client.post("/api/reminders/", json=sample_reminder_data)
        assert response.status_code == 422

    def test_get_all_reminders(self, client, create_reminder):
        create_reminder(title="Reminder 1")
        create_reminder(title="Reminder 2")
        create_reminder(title="Reminder 3")

        response = client.get("/api/reminders/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_get_reminder_by_id(self, client, create_reminder):
        reminder = create_reminder(title="Test Reminder")

        response = client.get(f"/api/reminders/{reminder.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(reminder.id)
        assert data["title"] == "Test Reminder"

    def test_get_nonexistent_reminder(self, client):
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/reminders/{fake_id}")
        assert response.status_code == 404

    def test_update_reminder(self, client, create_reminder):
        reminder = create_reminder(title="Original Title")

        update_data = {"title": "Updated Title"}
        response = client.patch(f"/api/reminders/{reminder.id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"

    def test_delete_reminder(self, client, create_reminder):
        reminder = create_reminder(title="To Delete")

        response = client.delete(f"/api/reminders/{reminder.id}")
        assert response.status_code == 204

        response = client.get(f"/api/reminders/{reminder.id}")
        assert response.status_code == 404

    def test_filter_reminders_by_status(self, client, create_reminder):
        from app.models.reminder import ReminderStatus

        create_reminder(title="Scheduled 1", status=ReminderStatus.SCHEDULED)
        create_reminder(title="Scheduled 2", status=ReminderStatus.SCHEDULED)
        create_reminder(title="Completed", status=ReminderStatus.COMPLETED)

        response = client.get("/api/reminders/?status=scheduled")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_search_reminders(self, client, create_reminder):
        create_reminder(title="Meeting with John")
        create_reminder(title="Call dentist")
        create_reminder(title="Meeting with Sarah")

        response = client.get("/api/reminders/?search=meeting")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
