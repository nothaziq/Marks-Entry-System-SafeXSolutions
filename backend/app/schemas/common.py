"""
Consistent response envelopes used across every endpoint, matching
the {success, message, data} / {success, message, errors} shapes
defined in Architecture.md section 10.
"""
from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: T | None = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: list[str] = []
