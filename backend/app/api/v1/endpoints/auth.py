from fastapi import APIRouter

from app.api.deps import DbSession, CurrentTeacher
from app.schemas.auth import LoginRequest, TokenResponse, TeacherProfile
from app.schemas.common import SuccessResponse
from app.services.auth_service import AuthService

router = APIRouter(tags=["Authentication"])


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
    return SuccessResponse(
        message="Profile retrieved.",
        data=TeacherProfile(
            id=str(current_teacher.id),
            full_name=current_teacher.full_name,
            email=current_teacher.email,
            is_admin=current_teacher.is_admin,
        ),
    )
