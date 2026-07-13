import uuid
from sqlalchemy.orm import Session

from app.models.student import Student
from app.repositories.base import BaseRepository


class StudentRepository(BaseRepository[Student]):
    def __init__(self, db: Session):
        super().__init__(db, Student)

    def list_for_class(self, class_id: uuid.UUID) -> list[Student]:
        return (
            self.db.query(Student)
            .filter(Student.class_id == class_id)
            .order_by(Student.roll_number)
            .all()
        )
