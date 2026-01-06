from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import UUID
import logging

from app.models.reminder import Reminder, CallAttempt, ReminderStatus, CallAttemptStatus
from app.services.vapi_service import vapi_service

logger = logging.getLogger(__name__)


class WebhookService:
    @staticmethod
    def process_vapi_webhook(db: Session, event_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            parsed = vapi_service.parse_webhook_event(event_data)

            event_type = parsed["event_type"]
            vapi_call_id = parsed["vapi_call_id"]
            reminder_id_str = parsed["reminder_id"]
            call_attempt_id_str = parsed["call_attempt_id"]

            if not vapi_call_id:
                logger.warning("Webhook received without vapi_call_id")
                return {"status": "ignored", "message": "No vapi_call_id in webhook"}

            logger.info(f"Processing Vapi webhook: {event_type} for call {vapi_call_id}")

            call_attempt = None

            if call_attempt_id_str:
                try:
                    call_attempt = (
                        db.query(CallAttempt)
                        .filter(CallAttempt.id == UUID(call_attempt_id_str))
                        .first()
                    )
                except ValueError:
                    pass

            if not call_attempt:
                call_attempt = (
                    db.query(CallAttempt).filter(CallAttempt.vapi_call_id == vapi_call_id).first()
                )

            if not call_attempt:
                logger.warning(f"CallAttempt not found for vapi_call_id: {vapi_call_id}")
                return {
                    "status": "not_found",
                    "message": f"CallAttempt not found for call {vapi_call_id}",
                }

            reminder = call_attempt.reminder

            if not reminder:
                logger.error(f"Reminder not found for call_attempt {call_attempt.id}")
                return {"status": "error", "message": "Reminder not found"}

            if event_type == "call.started":
                WebhookService._handle_call_started(call_attempt, reminder, parsed)

            elif event_type == "call.ended":
                WebhookService._handle_call_ended(call_attempt, reminder, parsed)

            elif event_type == "call.failed":
                WebhookService._handle_call_failed(call_attempt, reminder, parsed)

            else:
                logger.info(
                    f"Received {event_type} event for call {vapi_call_id} - no action needed"
                )

            db.commit()

            return {
                "status": "success",
                "message": f"Processed {event_type} for call {vapi_call_id}",
                "reminder_id": str(reminder.id),
                "call_attempt_id": str(call_attempt.id),
            }

        except Exception as e:
            logger.error(f"Error processing Vapi webhook: {str(e)}", exc_info=True)
            db.rollback()
            return {"status": "error", "message": str(e)}

    @staticmethod
    def _handle_call_started(call_attempt: CallAttempt, reminder: Reminder, parsed: Dict[str, Any]):
        call_attempt.status = CallAttemptStatus.ANSWERED
        logger.info(f"Call started for reminder {reminder.id}, " f"call_attempt {call_attempt.id}")

    @staticmethod
    def _handle_call_ended(call_attempt: CallAttempt, reminder: Reminder, parsed: Dict[str, Any]):
        call_attempt.status = CallAttemptStatus.COMPLETED
        call_attempt.completed_at = datetime.now(timezone.utc)

        if parsed.get("duration_seconds"):
            call_attempt.duration_seconds = int(parsed["duration_seconds"])

        reminder.status = ReminderStatus.COMPLETED
        reminder.completed_at = datetime.now(timezone.utc)
        reminder.updated_at = datetime.now(timezone.utc)

        logger.info(
            f"Call completed for reminder {reminder.id}. "
            f"Duration: {call_attempt.duration_seconds}s"
        )

    @staticmethod
    def _handle_call_failed(call_attempt: CallAttempt, reminder: Reminder, parsed: Dict[str, Any]):
        call_attempt.status = CallAttemptStatus.FAILED
        call_attempt.completed_at = datetime.now(timezone.utc)
        call_attempt.failure_reason = parsed.get("end_reason", "Call failed")

        reminder.status = ReminderStatus.FAILED
        reminder.failure_reason = call_attempt.failure_reason
        reminder.updated_at = datetime.now(timezone.utc)

        logger.warning(
            f"Call failed for reminder {reminder.id}. " f"Reason: {call_attempt.failure_reason}"
        )


webhook_service = WebhookService()
