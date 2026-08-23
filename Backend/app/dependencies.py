"""
Deccan Origin FastAPI — Shared Dependencies
JWT Bearer Token validation dependency used by protected routes.
"""
import jwt
from fastapi import Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.exceptions import UnauthorizedException

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validate JWT Bearer token. Returns user payload dict.
    Falls back to demo user in dev/debug mode if no credentials provided.
    Raises UnauthorizedException on invalid/expired tokens.
    """
    if credentials is None:
        if settings.DEBUG:
            return _demo_user()
        raise UnauthorizedException("Authentication token missing.")

    token = credentials.credentials

    # Accept known mock tokens in dev mode
    if settings.DEBUG and token.startswith("mock_jwt_token"):
        persona = "farmer"
        for p in ["buyer", "seller", "admin", "consumer", "bulkBuyer"]:
            if p in token:
                persona = p
                break
        return {"id": f"usr_{persona}_01", "name": "Deccan Demo Member", "persona": persona, "verified": True}

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Authentication token has expired.")
    except jwt.InvalidTokenError:
        if settings.DEBUG:
            return _demo_user()
        raise UnauthorizedException("Invalid authentication token.")

def _demo_user() -> dict:
    return {
        "id": "usr_farmer_01",
        "name": "Ramesh Patel",
        "persona": "farmer",
        "verified": True,
    }
