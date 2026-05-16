from fastapi import APIRouter, HTTPException
from datetime import datetime
from core.database import users_collection as users, otp_collection as otps
from schemas.otp import VerifyOtpRequest
from auth.jwt_utils import create_access_token

router = APIRouter()

@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest):
     
    mobile = data.mobile
    otp = data.otp
    device_Id = data.device_Id
    record = otps.find_one({
        "mobile": mobile,
        "otp": otp,
        "verified": False
    })
   
    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    # ✅ Mark OTP verified
    otps.update_one(
        {"_id": record["_id"]},
        {"$set": {"verified": True}}
    )

    user = users.find_one({"mobile": mobile})

    if not user:
        users.insert_one({
            "mobile": mobile,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "device_Id": device_Id
        })
    else:
        users.update_one(
            {"mobile": mobile},
            {"$set": {"last_login": datetime.utcnow(), "device_Id": device_Id}}
        )

    # 🔑 CREATE JWT
    access_token = create_access_token({
        "sub": mobile
    })

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }