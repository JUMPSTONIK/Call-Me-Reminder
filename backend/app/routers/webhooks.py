from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
import logging

from app.db.database import get_db
from app.services.webhook_service import webhook_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/vapi", status_code=status.HTTP_200_OK)
async def vapi_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        event_data = await request.json()

        logger.info(
            f"Received Vapi webhook: {event_data.get('type', 'unknown')} "
            f"for call {event_data.get('call', {}).get('id', 'unknown')}"
        )

        result = webhook_service.process_vapi_webhook(db, event_data)

        if result["status"] == "success":
            return {"message": "Webhook processed successfully", **result}
        elif result["status"] == "not_found":
            logger.warning(f"Webhook processing: {result['message']}")
            return {"message": result["message"]}
        else:
            logger.error(f"Webhook processing error: {result['message']}")
            return {"message": "Webhook received but processing failed", **result}

    except Exception as e:
        logger.error(f"Error handling Vapi webhook: {str(e)}", exc_info=True)
        return {"message": "Webhook received but error occurred", "error": str(e)}


@router.get("/vapi/test", status_code=status.HTTP_200_OK)
def test_webhook():
    return {
        "status": "ok",
        "message": "Vapi webhook endpoint is accessible",
        "endpoint": "/api/webhooks/vapi",
    }
