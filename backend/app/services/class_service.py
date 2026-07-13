import uuid

from sqlalchemy.orm import Session

from app.models.class_model import Class
from app.models.teacher import Teacher
from app.repositories.class_repository import ClassRepository
from app.repositories.student_repository import StudentRepository
from app.services.exceptions import ForbiddenError, NotFoundError


class ClassService:
    def __init__(self, db: Session):
        self.class_repo = ClassRepository(db)
        self.student_repo = StudentRepository(db)

    def get_classes_for_teacher(self, teacher_id: uuid.UUID) -> list[Class]:
        return self.class_repo.list_for_teacher(teacher_id)

    def get_students_for_class(self, class_id: uuid.UUID, teacher: Teacher):
        cls = self._get_owned_class(class_id, teacher)
        return self.student_repo.list_for_class(cls.id)

    def _get_owned_class(self, class_id: uuid.UUID, teacher: Teacher) -> Class:
        """Enforces: 'Teacher must own the class' (Architecture.md #11)."""
        cls = self.class_repo.get(class_id)
        if not cls:
            raise NotFoundError("Class not found.")
        if cls.teacher_id != teacher.id and not teacher.is_admin:
            raise ForbiddenError("You do not have access to this class.")
        return cls
