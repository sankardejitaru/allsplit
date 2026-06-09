from fastapi import APIRouter, UploadFile, File
from services.textract_service import run_textract


router = APIRouter(prefix="/textract", tags=["Textract"])


@router.post("/scan")
async def scan_bill(file: UploadFile = File(...)):
    result = await run_textract(file)
    return {
        "success": True,
        **result
    }