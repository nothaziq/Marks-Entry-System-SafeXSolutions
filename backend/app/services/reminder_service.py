"""
Daily attendance reminder logic. Pure and testable: takes a db session,
doesn't know about the scheduler or FastAPI. Called both by the
APScheduler job in app.main and by the manual trigger endpoint.
"""
import logging
from datetime import date

from sqlalchemy.orm import Session

from app.models.teacher import Teacher
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.class_repository import ClassRepository
from app.repositories.teacher_repository import TeacherRepository
from app.services.email_service import send_email

logger = logging.getLogger(__name__)


def _compose_email(teacher: Teacher, missing_class_names: list[str], today: date) -> tuple[str, str]:
    subject = f"Attendance reminder: {len(missing_class_names)} class(es) not marked today"
    class_list = "\n".join(f"  - {name}" for name in missing_class_names)
    body = (
        f"Hi {teacher.full_name},\n\n"
        f"You haven't marked attendance yet today ({today.isoformat()}) for:\n\n"
        f"{class_list}\n\n"
        "Please log in to the Marks Entry System to mark attendance for these classes.\n\n"
        "— Marks Entry System"
    )
    return subject, body


def run_daily_reminders(db: Session) -> int:
    """
    Emails every teacher (with reminders enabled, not already reminded today)
    who has one or more classes with no attendance recorded for today.
    Returns the number of emails actually sent.
    """
    today = date.today()
    teacher_repo = TeacherRepository(db)
    class_repo = ClassRepository(db)
    attendance_repo = AttendanceRepository(db)

    teachers = db.query(Teacher).filter(Teacher.reminders_enabled.is_(True)).all()

    sent_count = 0
    for teacher in teachers:
        if teacher.last_reminder_sent_date == today:
            continue  # already reminded today - idempotency guard

        classes = class_repo.list_for_teacher(teacher.id)
        missing_names = []
        for cls in classes:
            records = attendance_repo.list_for_class_and_date(cls.id, today)
            if not records:
                missing_names.append(cls.name)

        if not missing_names:
            continue

        subject, body = _compose_email(teacher, missing_names, today)
        was_sent = send_email(teacher.email, subject, body)

        # Mark as reminded today regardless of send success, so a single broken
        # send (e.g. bad credentials) doesn't retry-spam on every subsequent
        # trigger within the same day. Failures are already logged in email_service.
        teacher.last_reminder_sent_date = today
        db.add(teacher)

        if was_sent:
            sent_count += 1

    db.commit()
    return sent_count
