import uuid
from datetime import date

from fastapi import APIRouter, Query

from app.api.deps import DbSession, CurrentTeacher
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
    AttendanceListResponse,
)
from app.schemas.common import SuccessResponse
from app.services.attendance_service import AttendanceService

router = APIRouter(tags=["Attendance"])


def _to_response(record) -> AttendanceResponse:
    return AttendanceResponse.model_validate(
        {
            **record.__dict__,
            "id": str(record.id),
            "class_id": str(record.class_id),
            "student_id": str(record.student_id),
        }
    )


@router.post("/attendance", response_model=SuccessResponse[list[AttendanceResponse]], status_code=201)
def mark_attendance(payload: AttendanceCreate, db: DbSession, current_teacher: CurrentTeacher):
    records = AttendanceService(db).mark_attendance(payload, current_teacher)
    return SuccessResponse(message="Attendance saved successfully.", data=[_to_response(r) for r in records])


@router.get("/attendance", response_model=SuccessResponse[AttendanceListResponse])
def get_attendance(
    db: DbSession,
    current_teacher: CurrentTeacher,
    class_id: str = Query(...),
    date_: date = Query(..., alias="date"),
):
    records = AttendanceService(db).list_attendance(uuid.UUID(class_id), date_, current_teacher)
    return SuccessResponse(
        message="Attendance retrieved.",
        data=AttendanceListResponse(class_id=class_id, date=date_, records=[_to_response(r) for r in records]),
    )


@router.put("/attendance/{attendance_id}", response_model=SuccessResponse[AttendanceResponse])
def update_attendance(attendance_id: str, payload: AttendanceUpdate, db: DbSession, current_teacher: CurrentTeacher):
    record = AttendanceService(db).update_attendance(uuid.UUID(attendance_id), payload, current_teacher)
    return SuccessResponse(message="Attendance updated successfully.", data=_to_response(record))


@router.delete("/attendance/{attendance_id}", response_model=SuccessResponse[None])
def delete_attendance(attendance_id: str, db: DbSession, current_teacher: CurrentTeacher):
    AttendanceService(db).delete_attendance(uuid.UUID(attendance_id), current_teacher)
    return SuccessResponse(message="Attendance record deleted.")
