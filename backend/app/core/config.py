from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Call Me Reminder API"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str

    # Vapi
    VAPI_API_KEY: str = "sk_test_key"
    VAPI_ASSISTANT_ID: str = "asst_test_id"
    VAPI_PHONE_NUMBER: str = "+15551234567"

    # Twilio
    TWILIO_ACCOUNT_SID: str = "AC_test_sid"
    TWILIO_AUTH_TOKEN: str = "test_token"
    TWILIO_PHONE_NUMBER: str = "+15559876543"

    # API
    API_SECRET_KEY: str = "your-secret-key-min-32-chars-long-for-jwt-signing"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Scheduler
    SCHEDULER_TIMEZONE: str = "UTC"
    MAX_RETRY_ATTEMPTS: int = 3
    RETRY_DELAY_MINUTES: int = 5

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
