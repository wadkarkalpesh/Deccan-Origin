"""
Deccan Origin — Base API Request/Response Schemas
"""
from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, Any
from datetime import datetime

T = TypeVar("T")

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[ErrorResponse] = None
    requestId: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
