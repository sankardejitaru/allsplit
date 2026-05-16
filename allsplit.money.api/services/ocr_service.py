from google.cloud import vision
from google.oauth2 import service_account
from io import BytesIO
from PIL import Image
from services.bill_parser import parse_bill_items
from services.mobile_bill_parser import clean_mobile_ocr
from services.mobile_bill_service import parse_mobile_bill

# 🔑 Load credentials directly from file
credentials = service_account.Credentials.from_service_account_file(
    "credentials/google_vision_key.json"
)

vision_client = vision.ImageAnnotatorClient(credentials=credentials)


def google_vision_ocr(image_bytes: bytes) -> str:
    image = vision.Image(content=image_bytes)

    response = vision_client.text_detection(image=image)

    if response.error.message:
        raise RuntimeError(response.error.message)

    if not response.text_annotations:
        return ""

    # Full extracted text
    return response.text_annotations[0].description


def process_bill_ocr(file):
    image_bytes = file.file.read()

    # 1️⃣ Google Vision OCR
    text = google_vision_ocr(image_bytes)

    #cleaned_text = clean_mobile_ocr(text)
    # 2️⃣ Parse bill items
    items = parse_mobile_bill(text)

    return {
        "success": "true",
        "raw_text": text,
        "items": items
    }