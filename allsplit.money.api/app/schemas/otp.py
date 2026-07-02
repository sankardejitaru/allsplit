from typing import Literal, Optional

from pydantic import BaseModel, Field


class SendOtpRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=15)
    channel: Optional[Literal["sms", "whatsapp"]] = "sms"


class VerifyOtpRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=8)
    device_Id: str


class DeviceIdRequest(BaseModel):
    device_id: str


class DeviceIdSetPinRequest(BaseModel):
    device_id: str
    pin: str = Field(..., min_length=4, max_length=8)
