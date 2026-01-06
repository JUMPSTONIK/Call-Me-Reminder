import httpx
import logging
from typing import Optional, Dict, Any
from uuid import UUID

from app.core.config import settings
from app.models.reminder import Reminder

logger = logging.getLogger(__name__)


class VapiService:
    def __init__(self):
        self.api_url = settings.VAPI_API_URL
        self.api_key = settings.VAPI_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def trigger_call(
        self, reminder: Reminder, call_attempt_id: UUID
    ) -> tuple[bool, Optional[str], Optional[str]]:
        try:
            assistant_config = self._build_assistant_config(reminder)

            payload = {
                "phoneNumberId": settings.VAPI_PHONE_NUMBER_ID,
                "customer": {
                    "number": reminder.phone_number,
                },
                "assistant": assistant_config,
                "metadata": {
                    "reminder_id": str(reminder.id),
                    "call_attempt_id": str(call_attempt_id),
                    "title": reminder.title,
                },
            }

            if settings.VAPI_ASSISTANT_ID:
                payload["assistantId"] = settings.VAPI_ASSISTANT_ID
                del payload["assistant"]

            logger.info(
                f"Triggering Vapi call for reminder {reminder.id} to {reminder.phone_number}"
            )

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_url}/call/phone", headers=self.headers, json=payload
                )

                if response.status_code in [200, 201]:
                    call_data = response.json()
                    vapi_call_id = call_data.get("id")

                    logger.info(
                        f"Vapi call initiated successfully. "
                        f"Vapi Call ID: {vapi_call_id}, "
                        f"Reminder ID: {reminder.id}"
                    )

                    return True, vapi_call_id, None

                else:
                    error_msg = f"Vapi API error: {response.status_code} - {response.text}"
                    logger.error(
                        f"Failed to trigger Vapi call for reminder {reminder.id}: {error_msg}"
                    )
                    return False, None, error_msg

        except httpx.TimeoutException:
            error_msg = "Vapi API request timed out"
            logger.error(f"Timeout triggering call for reminder {reminder.id}")
            return False, None, error_msg

        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(
                f"Failed to trigger Vapi call for reminder {reminder.id}: {error_msg}",
                exc_info=True,
            )
            return False, None, error_msg

    def _build_assistant_config(self, reminder: Reminder) -> Dict[str, Any]:
        system_message = f"""You are a friendly reminder assistant making a phone call.

Your task is to:
1. Greet the person warmly
2. Deliver the following reminder message: "{reminder.message}"
3. Confirm they received the reminder
4. Say goodbye politely

Keep the call brief and friendly. If they don't answer, leave a voicemail with the reminder message.
"""

        assistant_name = f"Reminder: {reminder.title}"
        if len(assistant_name) > 40:
            assistant_name = assistant_name[:37] + "..."

        voice_parts = settings.VAPI_VOICE.split("-", 1)
        if len(voice_parts) == 2:
            voice_provider = voice_parts[0]
            voice_id = voice_parts[1]
        else:
            voice_provider = "playht"
            voice_id = settings.VAPI_VOICE

        config = {
            "name": assistant_name,
            "model": {
                "provider": "openai",
                "model": "gpt-3.5-turbo",
                "temperature": 0.7,
                "systemPrompt": system_message,
            },
            "voice": {"provider": voice_provider, "voiceId": voice_id},
            "firstMessage": f"Hello! This is a reminder call about: {reminder.title}.",
            "endCallFunctionEnabled": True,
            "endCallMessage": "Thank you! Have a great day. Goodbye!",
            "voicemailDetectionEnabled": True,
            "voicemailMessage": f"Hello, this is a reminder about {reminder.title}. {reminder.message}. Thank you!",
            "recordingEnabled": False,
        }

        return config

    async def get_call_status(self, vapi_call_id: str) -> Optional[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_url}/call/{vapi_call_id}", headers=self.headers
                )

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(
                        f"Failed to get Vapi call status for {vapi_call_id}: "
                        f"{response.status_code} - {response.text}"
                    )
                    return None

        except Exception as e:
            logger.error(
                f"Error fetching Vapi call status for {vapi_call_id}: {str(e)}", exc_info=True
            )
            return None

    def parse_webhook_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        event_type = event_data.get("type", "")
        call_data = event_data.get("call", {})

        metadata = call_data.get("metadata", {})
        reminder_id = metadata.get("reminder_id")
        call_attempt_id = metadata.get("call_attempt_id")

        vapi_call_id = call_data.get("id")
        status = call_data.get("status", "")
        duration = call_data.get("duration")
        end_reason = call_data.get("endedReason", "")
        cost = call_data.get("cost")

        parsed = {
            "event_type": event_type,
            "vapi_call_id": vapi_call_id,
            "reminder_id": reminder_id,
            "call_attempt_id": call_attempt_id,
            "status": status,
            "duration_seconds": duration,
            "end_reason": end_reason,
            "cost": cost,
            "raw_data": event_data,
        }

        logger.info(
            f"Parsed Vapi webhook event: {event_type} for call {vapi_call_id}, "
            f"reminder {reminder_id}"
        )

        return parsed


vapi_service = VapiService()
