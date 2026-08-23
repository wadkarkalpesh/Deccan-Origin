"""
Deccan Origin — Business Logic Service for Authentication and Identity Management
"""
import time
import uuid
import jwt
from typing import Dict, Any, Tuple, Optional
from app.config import settings
from app.services.db import db
from app.exceptions import UnauthorizedException, BadRequestException

class AuthService:
    @staticmethod
    def issue_jwt(user_id: str, name: str, persona: str) -> str:
        payload = {
            "id": user_id,
            "persona": persona,
            "name": name,
            "iat": int(time.time()),
            "exp": int(time.time()) + (settings.JWT_EXPIRE_HOURS * 3600),
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def build_user_profile(user_id: str, name: str, persona: str, extra: dict = None) -> dict:
        profile = {
            "id": user_id,
            "name": name,
            "persona": persona,
            "roles": [persona],
            "verified": True,
            "onboardingCompleted": True,
        }
        if extra:
            profile.update(extra)
        return profile

    def verify_otp(self, otp_code: str, persona: str, name: Optional[str] = None) -> Tuple[str, dict]:
        if len(otp_code) < 4:
            raise BadRequestException("Invalid OTP code structure.")
        
        user_id = f"usr_{persona}_{uuid.uuid4().hex[:6]}"
        resolved_name = name or ("Ramesh Patel" if persona == "farmer" else "Deccan Member")
        
        user_profile = self.build_user_profile(user_id, resolved_name, persona)
        token = self.issue_jwt(user_id, resolved_name, persona)
        
        # Save to memory db
        db.create_user(user_id, user_profile)
        
        return token, user_profile

    def login_with_password(self, email: str, persona: str) -> Tuple[str, dict]:
        # Clean check
        if not email:
            raise BadRequestException("Email is required.")
        
        user_data = db.get_user_by_email(email)
        if user_data:
            user_id = user_data["id"]
            name = user_data["name"]
            persona = user_data.get("persona", persona)
        else:
            # Auto-register for seamless dev flow
            user_id = f"usr_{persona}_{uuid.uuid4().hex[:6]}"
            name = email.split("@")[0].capitalize()
            
        user_profile = self.build_user_profile(user_id, name, persona, {"email": email})
        token = self.issue_jwt(user_id, name, persona)
        
        # Save or update in db
        db.create_user(email, user_profile)
        
        return token, user_profile

    def register_user(self, name: str, email: str, persona: str, state: str, district: str) -> Tuple[str, dict]:
        if not email or not name:
            raise BadRequestException("Name and Email/Phone are required for registration.")
            
        user_id = f"usr_{persona}_{uuid.uuid4().hex[:6]}"
        extra_fields = {
            "email": email,
            "state": state,
            "district": district,
            "onboardingCompleted": True
        }
        
        user_profile = self.build_user_profile(user_id, name, persona, extra_fields)
        token = self.issue_jwt(user_id, name, persona)
        
        db.create_user(email, user_profile)
        db.create_user(user_id, user_profile)
        
        return token, user_profile

auth_service = AuthService()
