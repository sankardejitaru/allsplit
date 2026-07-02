import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.core.database import otp_collection, users_collection
from app.core.security import create_access_token
from app.schemas.otp import SendOtpRequest, VerifyOtpRequest
from app.services.contact_service import ensure_saved_contact
from app.services.notification_service import deliver_otp
from app.utils.audit_helpers import audit_event
from app.utils.otp import otp_expiry, resolve_otp

logger = logging.getLogger(__name__)
router = APIRouter(tags=["OTP"])


@router.post("/send-otp")
def send_otp(data: SendOtpRequest):
    settings = get_settings()
    otp = resolve_otp()

    existing = otp_collection.find_one({"mobile": data.mobile})
    if existing:
        otp_collection.delete_one({"_id": existing["_id"]})

    otp_collection.insert_one({
        "mobile": data.mobile,
        "otp": otp,
        "expires_at": otp_expiry(),
        "verified": False,
        "channel": data.channel or "sms",
    })

    delivery = deliver_otp(data.mobile, otp, channel=data.channel or "sms")

    response = {
        "success": True,
        "message": "OTP sent successfully",
        "channel": data.channel or "sms",
        "delivery": delivery,
        "test_mode": settings.otp_test_mode,
    }

    if settings.otp_test_mode:
        response["dev_otp_hint"] = settings.otp_test_value

    audit_event(
        action="otp.send",
        category="auth",
        status="success",
        message="OTP sent",
        actor_mobile=data.mobile,
        details={
            "channel": data.channel or "sms",
            "delivery_status": delivery.get("status"),
        },
    )
    return response


@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest):
    record = otp_collection.find_one({
        "mobile": data.mobile,
        "otp": data.otp,
        "verified": False,
    })

    if not record:
        audit_event(
            action="otp.verify",
            category="auth",
            status="failure",
            message="Invalid OTP",
            actor_mobile=data.mobile,
            device_id=data.device_Id,
        )
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record["expires_at"] < datetime.utcnow():
        audit_event(
            action="otp.verify",
            category="auth",
            status="failure",
            message="OTP expired",
            actor_mobile=data.mobile,
            device_id=data.device_Id,
        )
        raise HTTPException(status_code=400, detail="OTP expired")

    otp_collection.update_one(
        {"_id": record["_id"]},
        {"$set": {"verified": True}},
    )

    user = users_collection.find_one({"mobile": data.mobile})
    is_new_user = user is None

    if not user:
        users_collection.insert_one({
            "mobile": data.mobile,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "device_Id": data.device_Id,
        })
    else:
        users_collection.update_one(
            {"mobile": data.mobile},
            {"$set": {
                "last_login": datetime.utcnow(),
                "device_Id": data.device_Id,
            }},
        )

    user = users_collection.find_one({"mobile": data.mobile})
    has_pin = user is not None and "SetPin" in user
    access_token = create_access_token(data.mobile)

    contact_created = False
    if is_new_user:
        contact_created = ensure_saved_contact(data.mobile)

    audit_event(
        action="otp.verify",
        category="auth",
        status="success",
        message="Registration successful" if is_new_user else "Login successful",
        actor_mobile=data.mobile,
        device_id=data.device_Id,
        details={
            "is_new_user": is_new_user,
            "has_pin": has_pin,
            "contact_saved": contact_created,
        },
    )
    return {
        "success": True,
        "message": "Registration successful" if is_new_user else "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "has_pin": has_pin,
        "contact_saved": contact_created,
    }
