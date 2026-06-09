import os
import uuid
from fastapi import APIRouter, UploadFile, File
from services.ocr_service import process_bill_ocr
from services.bill_parser import parse_bill_items

router = APIRouter()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(file: UploadFile):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    return file_path


@router.post("/scan-bill")
async def scan_bill(file: UploadFile = File(...)):
    # path = save_file(file)
    #return {"path": path}
    text = await process_bill_ocr(file) 

    return  text