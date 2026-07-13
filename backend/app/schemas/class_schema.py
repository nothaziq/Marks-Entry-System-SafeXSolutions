from pydantic import BaseModel


class ClassResponse(BaseModel):
    id: str
    name: str
    section: str | None
    course_id: str
    teacher_id: str

    model_config = {"from_attributes": True}
