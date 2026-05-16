from fastapi import APIRouter
from core.database import users_collection as Users
from schemas.otp import DeviceIdSetPinRequest
from utils.auth import hash_pin

router = APIRouter()

@router.post("/set-pin")
def set_pin(data: DeviceIdSetPinRequest):
    device = Users.find_one({"device_Id": data.device_id})

    if not device:
        return {"success": False, "message": "Device not registered"}

    Users.update_one({"device_Id": data.device_id}, {"$set": {"SetPin": hash_pin(data.pin)}})

    return {"success": True, "message": "Pin set successfully"}