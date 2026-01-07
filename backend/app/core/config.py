from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Call Me Reminder API"
    DEBUG: bool = True  # True for development, set to False in production
    ENVIRONMENT: str = "development"  # development or production
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str

    # Vapi Configuration
    VAPI_API_KEY: str = "sk_test_key"
    VAPI_API_URL: str = "https://api.vapi.ai"
    VAPI_ASSISTANT_ID: str = "asst_test_id"  # Optional: Use pre-configured assistant
    VAPI_PHONE_NUMBER_ID: str = ""  # Vapi phone number ID to call from
    VAPI_VOICE: str = "jennifer-playht"  # Default voice for calls

    # Webhook Configuration
    WEBHOOK_SECRET: str = ""  # Optional: For webhook signature verification
    WEBHOOK_BASE_URL: str = "http://localhost:8000"  # Local development, change in production

    # Twilio (Optional - not currently used)
    # TWILIO_ACCOUNT_SID: str = "AC_test_sid"
    # TWILIO_AUTH_TOKEN: str = "test_token"
    # TWILIO_PHONE_NUMBER: str = "+15559876543"

    # API
    API_SECRET_KEY: str = "your-secret-key-min-32-chars-long-for-jwt-signing"
    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000"  # Add production URLs in .env
    )

    # Scheduler
    SCHEDULER_TIMEZONE: str = "UTC"
    MAX_RETRY_ATTEMPTS: int = 3
    RETRY_DELAY_MINUTES: int = 5

    class Config:
        env_file = ".env.local"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
