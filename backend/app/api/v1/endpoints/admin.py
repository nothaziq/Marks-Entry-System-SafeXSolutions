from fastapi import APIRouter

from app.api.deps import DbSession, CurrentTeacher
from app.schemas.common import SuccessResponse
from app.services.reminder_service import run_daily_reminders

router = APIRouter(tags=["Admin"])


# NOTE: this is intentionally usable by any authenticated teacher for now,
# purely to make the reminder job testable during development without
# waiting for the scheduled time. If this app ever needs real multi-tenant
# security, gate this behind `current_teacher.is_admin`.
@router.post("/admin/trigger-reminders", response_model=SuccessResponse[dict])
def trigger_reminders(current_teacher: CurrentTeacher, db: DbSession):
    sent_count = run_daily_reminders(db)
    return SuccessResponse(
        message=f"Reminder job ran. {sent_count} email(s) sent.",
        data={"emails_sent": sent_count},
    )
