from fastapi import APIRouter
from schemas.user import UserCreate
from core.database import users_collection
from datetime import datetime
from schemas.otp import DeviceIdSetPinRequest
from utils.auth import hash_pin, verify_pin
from fastapi import HTTPException
from bson import ObjectId

router = APIRouter()
 

@router.post("/login-pin")
def check_device_router(device :DeviceIdSetPinRequest):
    devices = users_collection.find_one({"device_Id": device.device_id})
    if not devices:
        raise HTTPException(401, "Device not registered")

    user = users_collection.find_one({"_id": devices["_id"]})
    if not verify_pin(device.pin, user["SetPin"]):
        raise HTTPException(401, "Invalid PIN")

    users_collection.update_one(
        {"_id": devices["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    return {"LoginId": devices["id"], "message": "Login successful", "success": True}