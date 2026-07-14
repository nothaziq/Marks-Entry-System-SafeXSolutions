from datetime import date
from unittest.mock import patch

from app.models import Attendance, AttendanceStatus
from app.services.reminder_service import run_daily_reminders


def _mark_all_present_today(db_session, class_id, student_ids):
    for sid in student_ids:
        db_session.add(Attendance(class_id=class_id, student_id=sid, date=date.today(), status=AttendanceStatus.PRESENT))
    db_session.commit()


class _FakeUUID:
    """Helper to convert the string IDs from the seeded_class fixture back to UUID for direct model use."""


def test_teacher_with_all_classes_marked_gets_no_email(db_session, seeded_class):
    import uuid

    _mark_all_present_today(
        db_session,
        uuid.UUID(seeded_class["class_id"]),
        [uuid.UUID(sid) for sid in seeded_class["student_ids"]],
    )

    with patch("app.services.reminder_service.send_email") as mock_send:
        sent_count = run_daily_reminders(db_session)

    assert sent_count == 0
    mock_send.assert_not_called()


def test_teacher_with_unmarked_class_gets_email(db_session, seeded_class):
    # No attendance marked for today at all - the class is "missing".
    with patch("app.services.reminder_service.send_email", return_value=True) as mock_send:
        sent_count = run_daily_reminders(db_session)

    assert sent_count == 1
    mock_send.assert_called_once()
    call_args = mock_send.call_args
    assert call_args.args[0] == seeded_class["email"]
    assert "not marked" in call_args.args[2] or "not marked" in str(call_args)


def test_idempotency_skips_teacher_already_reminded_today(db_session, seeded_class):
    with patch("app.services.reminder_service.send_email", return_value=True) as mock_send:
        first_count = run_daily_reminders(db_session)
        second_count = run_daily_reminders(db_session)

    assert first_count == 1
    assert second_count == 0
    mock_send.assert_called_once()  # only the first run actually attempted a send


def test_teacher_with_reminders_disabled_is_skipped(db_session, seeded_class):
    from app.models import Teacher

    teacher = db_session.query(Teacher).filter(Teacher.email == seeded_class["email"]).first()
    teacher.reminders_enabled = False
    db_session.commit()

    with patch("app.services.reminder_service.send_email") as mock_send:
        sent_count = run_daily_reminders(db_session)

    assert sent_count == 0
    mock_send.assert_not_called()


def test_send_failure_still_marks_reminded_to_avoid_retry_spam(db_session, seeded_class):
    with patch("app.services.reminder_service.send_email", return_value=False) as mock_send:
        first_count = run_daily_reminders(db_session)
        second_count = run_daily_reminders(db_session)

    assert first_count == 0  # send failed, so nothing counted as "sent"
    assert second_count == 0
    mock_send.assert_called_once()  # but it wasn't retried on the second run
