from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.core.database import users_collection
from app.core.security import create_access_token, hash_pin, verify_pin
from app.schemas.otp import DeviceIdRequest, DeviceIdSetPinRequest
from app.services.device_service import find_user_by_device, unlink_device
from app.utils.audit_helpers import audit_event

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/check-device")
def check_device(data: DeviceIdRequest):
    device = find_user_by_device(data.device_id)

    if device:
        audit_event(
            action="auth.check_device",
            category="auth",
            status="success",
            message="Device registered",
            device_id=data.device_id,
            actor_mobile=device.get("mobile"),
            details={"has_pin": "SetPin" in device},
        )
        return {
            "registered": True,
            "user_id": str(device["_id"]),
            "has_pin": "SetPin" in device,
        }

    audit_event(
        action="auth.check_device",
        category="auth",
        status="success",
        message="Device not registered",
        device_id=data.device_id,
    )
    return {"registered": False}


@router.post("/unlink-device")
def unlink_device_endpoint(data: DeviceIdRequest):
    unlinked = unlink_device(data.device_id)

    audit_event(
        action="auth.unlink_device",
        category="auth",
        status="success",
        message="Device unlinked from user accounts",
        device_id=data.device_id,
        details={"unlinked_count": unlinked},
    )
    return {"success": True, "unlinked": unlinked}


@router.post("/set-pin")
def set_pin(data: DeviceIdSetPinRequest):
    device = find_user_by_device(data.device_id)

    if not device:
        audit_event(
            action="auth.set_pin",
            category="auth",
            status="failure",
            message="Device not registered",
            device_id=data.device_id,
        )
        return {"success": False, "message": "Device not registered"}

    users_collection.update_one(
        {"device_Id": data.device_id},
        {"$set": {"SetPin": hash_pin(data.pin)}},
    )

    audit_event(
        action="auth.set_pin",
        category="auth",
        status="success",
        message="PIN set successfully",
        device_id=data.device_id,
        actor_mobile=device.get("mobile"),
    )
    return {"success": True, "message": "Pin set successfully"}


@router.post("/login-pin")
def login_with_pin(data: DeviceIdSetPinRequest):
    user = find_user_by_device(data.device_id)

    if not user or "SetPin" not in user:
        audit_event(
            action="auth.login_pin",
            category="auth",
            status="failure",
            message="Device not registered",
            device_id=data.device_id,
        )
        raise HTTPException(status_code=401, detail="Device not registered")

    if not verify_pin(data.pin, user["SetPin"]):
        audit_event(
            action="auth.login_pin",
            category="auth",
            status="failure",
            message="Invalid PIN",
            device_id=data.device_id,
            actor_mobile=user.get("mobile"),
        )
        raise HTTPException(status_code=401, detail="Invalid PIN")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}},
    )

    access_token = create_access_token(user["mobile"])

    audit_event(
        action="auth.login_pin",
        category="auth",
        status="success",
        message="Login successful",
        device_id=data.device_id,
        actor_mobile=user.get("mobile"),
    )
    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "LoginId": str(user["_id"]),
    }
