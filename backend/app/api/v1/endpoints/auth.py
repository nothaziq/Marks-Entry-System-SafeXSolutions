from fastapi import APIRouter

from app.api.deps import DbSession, CurrentTeacher
from app.models.teacher import Teacher
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    TeacherProfile,
    ChangePasswordRequest,
)
from app.schemas.common import SuccessResponse
from app.services.auth_service import AuthService

router = APIRouter(tags=["Authentication"])


def _to_profile(teacher: Teacher) -> TeacherProfile:
    return TeacherProfile(
        id=str(teacher.id),
        full_name=teacher.full_name,
        email=teacher.email,
        is_admin=teacher.is_admin,
        is_active=teacher.is_active,
        created_at=teacher.created_at,
    )


@router.post("/login", response_model=SuccessResponse[TokenResponse])
def login(payload: LoginRequest, db: DbSession):
    token = AuthService(db).login(payload)
    return SuccessResponse(message="Login successful.", data=token)


@router.post("/logout", response_model=SuccessResponse[None])
def logout():
    # JWTs are stateless; logout is handled client-side by discarding the token.
    # A denylist table could be added later if immediate server-side revocation is required.
    return SuccessResponse(message="Logged out successfully.")


@router.get("/profile", response_model=SuccessResponse[TeacherProfile])
def profile(current_teacher: CurrentTeacher):
    return SuccessResponse(message="Profile retrieved.", data=_to_profile(current_teacher))


@router.post("/change-password", response_model=SuccessResponse[None])
def change_password(payload: ChangePasswordRequest, current_teacher: CurrentTeacher, db: DbSession):
    AuthService(db).change_password(current_teacher, payload)
    return SuccessResponse(message="Password updated successfully.")
