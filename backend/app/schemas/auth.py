from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TeacherProfile(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    is_admin: bool

    model_config = {"from_attributes": True}
