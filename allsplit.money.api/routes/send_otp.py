from fastapi import APIRouter
from core.database import otp_collection as otps
from otp_utils import generate_otp, otp_expiry
from schemas.otp import SendOtpRequest

router = APIRouter()

@router.post("/send-otp")
def send_otp(data: SendOtpRequest):
    mobile = data.mobile
    # otp = generate_otp()
    otp = "123456"  # TEMP for testing

    temp_otp = otps.find_one({"mobile": mobile})
    if temp_otp:
        otps.delete_one({"_id": temp_otp["_id"]})

    otps.insert_one({
        "mobile": mobile,
        "otp": otp,
        "expires_at": otp_expiry(),
        "verified": False
    })

    print("OTP:", otp)  # TEMP for testing

    return {
        "success": True,
        "message": "OTP sent successfully"
    }