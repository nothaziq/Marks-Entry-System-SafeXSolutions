from __future__ import annotations
import enum
import uuid
from datetime import date as date_type

from sqlalchemy import String, Date, Text, ForeignKey, Enum as SAEnum, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    LEAVE = "leave"


class Attendance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "attendance"
    __table_args__ = (
        # A student can only have ONE attendance record per class per day.
        UniqueConstraint("class_id", "student_id", "date", name="uq_attendance_class_student_date"),
        Index("ix_attendance_class_date", "class_id", "date"),
    )

    class_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    status: Mapped[AttendanceStatus] = mapped_column(SAEnum(AttendanceStatus, name="attendance_status"), nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    class_: Mapped["Class"] = relationship(back_populates="attendance_records")
    student: Mapped["Student"] = relationship(back_populates="attendance_records")
