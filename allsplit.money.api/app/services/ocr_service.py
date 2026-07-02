import os
from io import BytesIO

from fastapi import UploadFile

from app.core.config import get_settings
from app.services.bill.bill_items_parser import extract_items_from_text
from app.services.bill.mobile_bill_parser import clean_mobile_ocr

_vision_client = None


def _get_vision_client():
    global _vision_client
    if _vision_client is not None:
        return _vision_client

    from google.cloud import vision
    from google.oauth2 import service_account

    settings = get_settings()
    credentials_path = settings.google_vision_credentials_path

    if not os.path.isfile(credentials_path):
        raise RuntimeError(
            f"Google Vision credentials not found at '{credentials_path}'. "
            "Set GOOGLE_VISION_CREDENTIALS_PATH in your environment."
        )

    credentials = service_account.Credentials.from_service_account_file(credentials_path)
    _vision_client = vision.ImageAnnotatorClient(credentials=credentials)
    return _vision_client


def preprocess_image(image_bytes: bytes) -> bytes:
    import cv2
    import numpy as np
    from PIL import Image

    np_img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        15,
    )
    denoised = cv2.medianBlur(thresh, 3)

    pil_img = Image.fromarray(denoised)
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")
    return buffer.getvalue()


def google_vision_ocr(image_bytes: bytes) -> str:
    from google.cloud import vision
    from google.cloud.vision_v1 import ImageContext

    client = _get_vision_client()
    image = vision.Image(content=image_bytes)
    image_context = ImageContext(language_hints=["en"])

    response = client.document_text_detection(image=image, image_context=image_context)

    if response.error.message:
        raise RuntimeError(response.error.message)

    if not response.full_text_annotation:
        return ""

    return response.full_text_annotation.text


async def process_bill_ocr(file: UploadFile):
    raw_bytes = await file.read()

    if not raw_bytes:
        raise ValueError("Uploaded file is empty")

    raw_text = google_vision_ocr(raw_bytes)
    cleaned_text = clean_mobile_ocr(raw_text)
    items, parse_meta = extract_items_from_text(cleaned_text)

    return {
        "success": len(items) > 0,
        "message": (
            "Bill scanned successfully"
            if items
            else "Could not detect line items. Try a clearer photo."
        ),
        "items": items,
        "parse_meta": parse_meta,
        "source": "google_vision",
        "raw_text": raw_text,
        "cleaned_text": cleaned_text,
    }
