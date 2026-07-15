from fastapi import APIRouter

from app.api.deps import DbSession, CurrentAdmin
from app.schemas.common import SuccessResponse
from app.services.reminder_service import run_daily_reminders

router = APIRouter(tags=["Admin"])


@router.post("/admin/trigger-reminders", response_model=SuccessResponse[dict])
def trigger_reminders(current_admin: CurrentAdmin, db: DbSession):
    """Admin-only: runs the daily reminder job immediately, for testing/ops use."""
    sent_count = run_daily_reminders(db)
    return SuccessResponse(
        message=f"Reminder job ran. {sent_count} email(s) sent.",
        data={"emails_sent": sent_count},
    )
