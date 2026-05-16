from fastapi import APIRouter
from core.database import users_collection as Users
from schemas.otp import DeviceIdRequest

router = APIRouter()

@router.post("/check-device")
def check_device(data: DeviceIdRequest):
    device = Users.find_one({"device_Id": data.device_id})

    #✅ If device found, return user info to check SetPin in Users collection

    user_id = "SetPin" in device if True else False

    if device:
        return {
            "registered": True,
            "user_id": str(device["_id"]),
            "has_pin": user_id
        }
    
   

    return {"registered": False}