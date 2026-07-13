from __future__ import annotations
import uuid

from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Class(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A single teaching section, e.g. 'BSSE-2A - Software Engineering'."""
    __tablename__ = "classes"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    section: Mapped[str] = mapped_column(String(30), nullable=True)

    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    teacher_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teachers.id"), nullable=False)

    course: Mapped["Course"] = relationship(back_populates="classes")
    teacher: Mapped["Teacher"] = relationship(back_populates="classes")
    students: Mapped[list["Student"]] = relationship(back_populates="class_")
    attendance_records: Mapped[list["Attendance"]] = relationship(back_populates="class_")
