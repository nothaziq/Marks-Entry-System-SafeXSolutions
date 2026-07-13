from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.models.attendance import AttendanceStatus


class AttendanceEntry(BaseModel):
    """One student's status within a bulk attendance submission."""
    student_id: str
    status: AttendanceStatus
    remarks: str | None = None


class AttendanceCreate(BaseModel):
    """
    Payload for POST /attendance.
    Teachers mark an entire class roster at once for a given date.
    """
    class_id: str
    date: date
    entries: list[AttendanceEntry] = Field(min_length=1)

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Attendance date cannot be in the future.")
        return v


class AttendanceUpdate(BaseModel):
    """Payload for PUT /attendance/{id} - update a single record."""
    status: AttendanceStatus | None = None
    remarks: str | None = None


class AttendanceResponse(BaseModel):
    id: str
    class_id: str
    student_id: str
    date: date
    status: AttendanceStatus
    remarks: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AttendanceListResponse(BaseModel):
    class_id: str
    date: date
    records: list[AttendanceResponse]
