from sqlalchemy.orm import Session

from app.core.security import verify_password, hash_password, create_access_token
from app.models.teacher import Teacher
from app.repositories.teacher_repository import TeacherRepository
from app.schemas.auth import LoginRequest, TokenResponse, ChangePasswordRequest
from app.services.exceptions import AuthenticationError, ValidationError


class AuthService:
    def __init__(self, db: Session):
        self.teacher_repo = TeacherRepository(db)

    def login(self, payload: LoginRequest) -> TokenResponse:
        teacher = self.teacher_repo.get_by_email(payload.email)
        if not teacher or not verify_password(payload.password, teacher.password_hash):
            raise AuthenticationError("Invalid email or password.")
        if not teacher.is_active:
            raise AuthenticationError("This account has been deactivated.")

        token = create_access_token(
            subject=str(teacher.id),
            extra_claims={"email": teacher.email, "is_admin": teacher.is_admin},
        )
        return TokenResponse(access_token=token)

    def change_password(self, teacher: Teacher, payload: ChangePasswordRequest) -> None:
        if not verify_password(payload.current_password, teacher.password_hash):
            raise AuthenticationError("Current password is incorrect.")
        if payload.new_password != payload.confirm_password:
            raise ValidationError("New password and confirmation don't match.")

        teacher.password_hash = hash_password(payload.new_password)
        self.teacher_repo.commit_refresh(teacher)
