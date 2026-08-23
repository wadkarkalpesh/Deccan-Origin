"""
Deccan Origin — Rate Limiting Configuration
Using SlowAPI to rate limit critical authentication and marketplace routes.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Setup global rate limiter using client IP address
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120 per minute"]
)
