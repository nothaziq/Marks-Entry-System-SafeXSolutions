import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.teacher import Teacher
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.class_repository import ClassRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate
from app.services.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError


class AttendanceService:
    """
    Implements the business rules from Architecture.md #11 'Validation Rules':
      - Class must exist
      - Teacher must own the class
      - Date cannot be in the future (also enforced at the schema level)
      - Every student must have a status
      - Duplicate attendance is prevented
    No SQL lives in this layer - everything goes through the repositories.
    """

    def __init__(self, db: Session):
        self.attendance_repo = AttendanceRepository(db)
        self.class_repo = ClassRepository(db)
        self.student_repo = StudentRepository(db)

    def _get_owned_class(self, class_id: uuid.UUID, teacher: Teacher):
        cls = self.class_repo.get(class_id)
        if not cls:
            raise NotFoundError("Class not found.")
        if cls.teacher_id != teacher.id and not teacher.is_admin:
            raise ForbiddenError("You do not own this class.")
        return cls

    def mark_attendance(self, payload: AttendanceCreate, teacher: Teacher) -> list[Attendance]:
        class_id = uuid.UUID(payload.class_id)
        cls = self._get_owned_class(class_id, teacher)

        roster = self.student_repo.list_for_class(cls.id)
        roster_ids = {str(s.id) for s in roster}
        submitted_ids = {e.student_id for e in payload.entries}

        # "Every student must have a status"
        missing = roster_ids - submitted_ids
        if missing:
            raise ValidationError(
                f"Attendance status missing for {len(missing)} student(s) on the roster."
            )
        unknown = submitted_ids - roster_ids
        if unknown:
            raise ValidationError("One or more students do not belong to this class.")

        # "Duplicate attendance is prevented"
        existing = self.attendance_repo.list_for_class_and_date(cls.id, payload.date)
        if existing:
            raise ConflictError(
                f"Attendance for this class on {payload.date} has already been recorded. "
                "Use PUT /attendance/{id} to update individual records instead."
            )

        records = [
            Attendance(
                class_id=cls.id,
                student_id=uuid.UUID(entry.student_id),
                date=payload.date,
                status=entry.status,
                remarks=entry.remarks,
            )
            for entry in payload.entries
        ]
        return self.attendance_repo.bulk_create(records)

    def list_attendance(self, class_id: uuid.UUID, target_date: date, teacher: Teacher) -> list[Attendance]:
        self._get_owned_class(class_id, teacher)
        return self.attendance_repo.list_for_class_and_date(class_id, target_date)

    def update_attendance(self, attendance_id: uuid.UUID, payload: AttendanceUpdate, teacher: Teacher) -> Attendance:
        record = self.attendance_repo.get(attendance_id)
        if not record:
            raise NotFoundError("Attendance record not found.")
        self._get_owned_class(record.class_id, teacher)

        if payload.status is not None:
            record.status = payload.status
        if payload.remarks is not None:
            record.remarks = payload.remarks

        return self.attendance_repo.commit_refresh(record)

    def delete_attendance(self, attendance_id: uuid.UUID, teacher: Teacher) -> None:
        record = self.attendance_repo.get(attendance_id)
        if not record:
            raise NotFoundError("Attendance record not found.")
        self._get_owned_class(record.class_id, teacher)
        self.attendance_repo.delete(record)
