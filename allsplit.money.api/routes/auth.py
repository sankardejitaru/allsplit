from fastapi import APIRouter
from schemas.user import UserCreate
from core.database import users_collection
from datetime import datetime

router = APIRouter()

@router.post("/register")
def auth_router(
    phone: str,
    pin: str,
    device_id: str,
    device_name: str
):
    user = users.find_one({"phone": phone})

    if not user:
        user_id = users.insert_one({
            "phone": phone,
            "pin_hash": hash_pin(pin),
            "created_at": datetime.utcnow()
        }).inserted_id
    else:
        user_id = user["_id"]
        users.update_one(
            {"_id": user_id},
            {"$set": {"pin_hash": hash_pin(pin)}}
        )

    devices.insert_one({
        "user_id": user_id,
        "device_id": device_id,
        "device_name": device_name,
        "last_login": datetime.utcnow()
    })

    return {"success": True}
 