import uuid
from sqlalchemy.orm import Session

from app.models.class_model import Class
from app.repositories.base import BaseRepository


class ClassRepository(BaseRepository[Class]):
    def __init__(self, db: Session):
        super().__init__(db, Class)

    def list_for_teacher(self, teacher_id: uuid.UUID) -> list[Class]:
        return self.db.query(Class).filter(Class.teacher_id == teacher_id).all()
