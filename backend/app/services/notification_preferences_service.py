from sqlalchemy.orm import Session

from app.models.teacher import Teacher
from app.repositories.teacher_repository import TeacherRepository
from app.schemas.notifications import NotificationPreferencesResponse, UpdateNotificationPreferencesRequest


class NotificationPreferencesService:
    def __init__(self, db: Session):
        self.teacher_repo = TeacherRepository(db)

    def get_preferences(self, teacher: Teacher) -> NotificationPreferencesResponse:
        return NotificationPreferencesResponse(reminders_enabled=teacher.reminders_enabled)

    def update_preferences(
        self, teacher: Teacher, payload: UpdateNotificationPreferencesRequest
    ) -> NotificationPreferencesResponse:
        teacher.reminders_enabled = payload.reminders_enabled
        self.teacher_repo.commit_refresh(teacher)
        return NotificationPreferencesResponse(reminders_enabled=teacher.reminders_enabled)
