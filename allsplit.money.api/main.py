from fastapi import FastAPI, Depends
from routes.send_otp import router as send_otp_router
from routes.verify_otp import router as verify_otp_router
from routes.profile import router as profile_router
from routes.auth import router as auth_router
from routes.ocr import router as ocr_router
from auth.deps import get_current_user 
from routes.check_device import router as check_device_router
from routes.set_device import router as set_device_router
from routes.login_device import router as login_device_router
from routes.split import router as split_router
from routes.myowe import router as owe_router
from routes.poc import router as poc_router
from routes.update_prize import router as update_price_router
from routes.close_bill import router as close_bill_router
from routes.textract import router as text_router
from routes.contacts import router as contacts_router

app = FastAPI(title="Bill Split App")

# Public routes
app.include_router(send_otp_router)
app.include_router(verify_otp_router)
app.include_router(profile_router)
app.include_router(auth_router, prefix="/auth")
app.include_router(check_device_router, prefix="/auth")
app.include_router(ocr_router, prefix="/ocr")
app.include_router(set_device_router, prefix="/auth")
app.include_router(login_device_router, prefix="/auth")
app.include_router(split_router)
app.include_router(owe_router)
app.include_router(poc_router)
app.include_router(update_price_router)
app.include_router(close_bill_router)
app.include_router(text_router)
app.include_router(contacts_router)
