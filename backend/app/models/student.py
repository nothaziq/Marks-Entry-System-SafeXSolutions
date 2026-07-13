from __future__ import annotations
import uuid

from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Student(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "students"

    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    roll_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)

    class_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)

    class_: Mapped["Class"] = relationship(back_populates="students")
    attendance_records: Mapped[list["Attendance"]] = relationship(back_populates="student")
