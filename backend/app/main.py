"""
Application entry point: creates the FastAPI app, wires up CORS,
exception handlers, the versioned API router, and the daily attendance
reminder job.

Run locally with:  uvicorn app.main:app --reload
"""
import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.database.session import SessionLocal
from app.middleware.error_handler import register_exception_handlers
from app.services.reminder_service import run_daily_reminders

logger = logging.getLogger(__name__)


def _run_reminder_job() -> None:
    """Sync wrapper: opens its own DB session since it runs outside a request."""
    db = SessionLocal()
    try:
        sent_count = run_daily_reminders(db)
        logger.info("Daily reminder job complete: %s email(s) sent.", sent_count)
    except Exception:
        logger.exception("Daily reminder job failed.")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Created fresh per app startup (not module-level) so it always binds to
    # the currently-running event loop - important because the test suite
    # starts/stops the app once per test, each with its own event loop.
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        _run_reminder_job,
        trigger="cron",
        hour=settings.REMINDER_HOUR,
        minute=settings.REMINDER_MINUTE,
        id="daily_attendance_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        "Reminder scheduler started: daily at %02d:%02d server-local time.",
        settings.REMINDER_HOUR,
        settings.REMINDER_MINUTE,
    )
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title=settings.APP_NAME,
    description="Attendance Module (Teacher Side) - Marks Entry System, Group 22",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"success": True, "message": "Attendance Module API is running.", "data": None}
