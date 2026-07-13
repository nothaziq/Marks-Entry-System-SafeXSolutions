"""Small helpers kept separate from schemas so endpoints stay terse."""
from app.schemas.common import SuccessResponse


def ok(message: str, data=None) -> SuccessResponse:
    return SuccessResponse(message=message, data=data)
