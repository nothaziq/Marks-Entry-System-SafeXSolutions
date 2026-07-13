from pydantic import BaseModel


class StudentResponse(BaseModel):
    id: str
    full_name: str
    roll_number: str
    class_id: str

    model_config = {"from_attributes": True}
