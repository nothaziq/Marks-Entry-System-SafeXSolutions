from sqlalchemy.orm import Session

from app.models.teacher import Teacher
from app.repositories.base import BaseRepository


class TeacherRepository(BaseRepository[Teacher]):
    def __init__(self, db: Session):
        super().__init__(db, Teacher)

    def get_by_email(self, email: str) -> Teacher | None:
        return self.db.query(Teacher).filter(Teacher.email == email).first()
