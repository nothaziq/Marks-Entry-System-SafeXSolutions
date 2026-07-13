"""
Maps domain-level service exceptions (and validation errors) to
consistent JSON error responses, per Architecture.md #10:
  { "success": false, "message": "...", "errors": [] }
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.services.exceptions import (
    ServiceError,
    NotFoundError,
    ForbiddenError,
    ConflictError,
    ValidationError,
    AuthenticationError,
)

_STATUS_MAP: dict[type[ServiceError], int] = {
    NotFoundError: 404,
    ForbiddenError: 403,
    ConflictError: 409,
    ValidationError: 422,
    AuthenticationError: 401,
}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ServiceError)
    async def service_error_handler(request: Request, exc: ServiceError):
        status_code = _STATUS_MAP.get(type(exc), 400)
        return JSONResponse(
            status_code=status_code,
            content={"success": False, "message": exc.message, "errors": [exc.message]},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        errors = [f"{'.'.join(str(loc) for loc in e['loc'])}: {e['msg']}" for e in exc.errors()]
        return JSONResponse(
            status_code=422,
            content={"success": False, "message": "Validation failed.", "errors": errors},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "An unexpected error occurred.", "errors": [str(exc)]},
        )
