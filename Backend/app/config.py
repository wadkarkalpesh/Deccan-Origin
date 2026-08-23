"""
Deccan Origin FastAPI — Application Settings
Loaded from environment variables / .env file
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Server
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("NODE_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "deccan_origin_jwt_secret_key_2026_change_in_prod")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_HOURS: int = int(os.getenv("JWT_EXPIRE_HOURS", 72))

    # Supabase PostgreSQL
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://xyz-deccan-origin.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "anon-key-deccan-origin-2026")

    # Payment Gateways
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_deccanorigin2026_key")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rzp_secret_deccanorigin2026")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_stripe_deccanorigin2026")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_deccanorigin2026")

    # CORS
    CORS_ORIGINS: list = ["*"]

settings = Settings()
