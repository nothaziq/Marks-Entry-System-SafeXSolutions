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
from app.services.exceptions import AuthenticationError

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
