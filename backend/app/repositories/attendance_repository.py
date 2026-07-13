import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: Session):
        super().__init__(db, Attendance)

    def list_for_class_and_date(self, class_id: uuid.UUID, target_date: date) -> list[Attendance]:
        return (
            self.db.query(Attendance)
            .filter(Attendance.class_id == class_id, Attendance.date == target_date)
            .all()
        )

    def get_by_class_student_date(
        self, class_id: uuid.UUID, student_id: uuid.UUID, target_date: date
    ) -> Attendance | None:
        return (
            self.db.query(Attendance)
            .filter(
                Attendance.class_id == class_id,
                Attendance.student_id == student_id,
                Attendance.date == target_date,
            )
            .first()
        )

    def bulk_create(self, records: list[Attendance]) -> list[Attendance]:
        self.db.add_all(records)
        self.db.commit()
        for r in records:
            self.db.refresh(r)
        return records
