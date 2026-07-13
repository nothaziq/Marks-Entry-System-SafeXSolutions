"""
Domain-level exceptions raised by the service layer.
The API layer maps these to proper HTTP status codes -
services never know about HTTP.
"""


class ServiceError(Exception):
    """Base class for all service-layer errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(ServiceError):
    pass


class ForbiddenError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass


class ValidationError(ServiceError):
    pass


class AuthenticationError(ServiceError):
    pass
