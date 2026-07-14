from __future__ import annotations
from datetime import date as date_type

from sqlalchemy import String, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Teacher(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "teachers"

    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    reminders_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    last_reminder_sent_date: Mapped[date_type | None] = mapped_column(Date, nullable=True)

    classes: Mapped[list["Class"]] = relationship(back_populates="teacher")
