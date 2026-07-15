"""
Shared FastAPI dependencies: DB session re-export + the
'get_current_teacher' dependency that every protected route uses.
"""
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.teacher import Teacher
from app.repositories.teacher_repository import TeacherRepository
from app.services.exceptions import AuthenticationError, ForbiddenError

DbSession = Annotated[Session, Depends(get_db)]


def get_current_teacher(
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
) -> Teacher:
    """
    Reads 'Authorization: Bearer <token>', verifies the JWT, and loads
    the Teacher row. Raises AuthenticationError (mapped to 401) on any failure.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthenticationError("Missing or malformed Authorization header.")

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise AuthenticationError("Invalid or expired token.")

    teacher = TeacherRepository(db).get_by_email(payload.get("email", ""))
    if not teacher:
        raise AuthenticationError("Teacher account no longer exists.")
    return teacher


CurrentTeacher = Annotated[Teacher, Depends(get_current_teacher)]


def require_admin(current_teacher: CurrentTeacher) -> Teacher:
    """
    Same as CurrentTeacher, but additionally requires is_admin. Use for
    routes that affect data beyond the requesting teacher's own classes
    (e.g. triggering a job that emails every teacher in the system).
    Raises ForbiddenError (mapped to 403) if the teacher isn't an admin.
    """
    if not current_teacher.is_admin:
        raise ForbiddenError("This action requires an administrator account.")
    return current_teacher


CurrentAdmin = Annotated[Teacher, Depends(require_admin)]
