import random
from datetime import datetime, timedelta

from app.core.config import get_settings


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def otp_expiry() -> datetime:
    settings = get_settings()
    return datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)


def resolve_otp() -> str:
    settings = get_settings()
    if settings.otp_test_mode:
        return settings.otp_test_value
    return generate_otp()
