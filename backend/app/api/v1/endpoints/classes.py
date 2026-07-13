from fastapi import APIRouter

from app.api.deps import DbSession, CurrentTeacher
from app.schemas.class_schema import ClassResponse
from app.schemas.student import StudentResponse
from app.schemas.common import SuccessResponse
from app.services.class_service import ClassService

router = APIRouter(tags=["Classes"])


@router.get("/teacher/classes", response_model=SuccessResponse[list[ClassResponse]])
def get_my_classes(db: DbSession, current_teacher: CurrentTeacher):
    classes = ClassService(db).get_classes_for_teacher(current_teacher.id)
    data = [ClassResponse.model_validate({**c.__dict__, "id": str(c.id), "course_id": str(c.course_id), "teacher_id": str(c.teacher_id)}) for c in classes]
    return SuccessResponse(message="Classes retrieved.", data=data)


@router.get("/classes/{class_id}/students", response_model=SuccessResponse[list[StudentResponse]])
def get_class_students(class_id: str, db: DbSession, current_teacher: CurrentTeacher):
    import uuid
    students = ClassService(db).get_students_for_class(uuid.UUID(class_id), current_teacher)
    data = [StudentResponse.model_validate({**s.__dict__, "id": str(s.id), "class_id": str(s.class_id)}) for s in students]
    return SuccessResponse(message="Students retrieved.", data=data)
