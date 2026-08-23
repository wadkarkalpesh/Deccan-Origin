"""
Deccan Origin — Custom Exception Classes for Standardized API Errors
"""
from fastapi import HTTPException, status

class DeccanAPIException(Exception):
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_SERVER_ERROR",
        message: str = "An unexpected error occurred.",
        details: dict = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class NotFoundException(DeccanAPIException):
    def __init__(self, message: str = "Resource not found.", details: dict = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            message=message,
            details=details
        )

class UnauthorizedException(DeccanAPIException):
    def __init__(self, message: str = "Authentication credentials not provided or invalid.", details: dict = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED",
            message=message,
            details=details
        )

class ForbiddenException(DeccanAPIException):
    def __init__(self, message: str = "You do not have permission to access this resource.", details: dict = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
            message=message,
            details=details
        )

class BadRequestException(DeccanAPIException):
    def __init__(self, message: str = "Bad request parameters.", details: dict = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="BAD_REQUEST",
            message=message,
            details=details
        )

class ConflictException(DeccanAPIException):
    def __init__(self, message: str = "Resource conflict.", details: dict = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            error_code="CONFLICT",
            message=message,
            details=details
        )
