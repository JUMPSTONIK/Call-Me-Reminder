from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.routers import reminders
from app.services.scheduler_service import scheduler
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting up Call Me Reminder API...")

    # Start the scheduler
    scheduler.start()
    logger.info("Scheduler started")

    # Reschedule all pending reminders
    scheduler.reschedule_all_pending()
    logger.info("Pending reminders rescheduled")

    yield

    # Shutdown
    logger.info("Shutting down Call Me Reminder API...")
    scheduler.shutdown()
    logger.info("Scheduler shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="1.0.0",
    description="Automated phone call reminders API",
    lifespan=lifespan
)

# Configure CORS
origins = settings.ALLOWED_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reminders.router, prefix="/api/reminders", tags=["Reminders"])


@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Call Me Reminder API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "reminders": "/api/reminders",
            "health": "/health"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    scheduler_status = "running" if scheduler._scheduler and scheduler._scheduler.running else "stopped"
    scheduled_jobs_count = len(scheduler.get_scheduled_jobs()) if scheduler._scheduler else 0

    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected",
        "scheduler": {
            "status": scheduler_status,
            "scheduled_jobs": scheduled_jobs_count
        }
    }
