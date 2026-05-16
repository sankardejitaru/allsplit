from pydantic import BaseModel

class SendOtpRequest(BaseModel):
    mobile: str

class VerifyOtpRequest(BaseModel):
    mobile: str
    otp: str
    device_Id: str
class DeviceIdRequest(BaseModel):
    device_id: str
class DeviceIdSetPinRequest(BaseModel):
    device_id: str
    pin: str