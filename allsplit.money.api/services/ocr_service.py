import re
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
from google.cloud import vision
from google.oauth2 import service_account
from google.cloud.vision_v1 import ImageContext

from services.mobile_bill_parser import clean_mobile_ocr, parse_mobile_bill

# 🔑 Load credentials
credentials = service_account.Credentials.from_service_account_file(
    "credentials/google_vision_key.json"
)

vision_client = vision.ImageAnnotatorClient(credentials=credentials)


# ==========================================================
# IMAGE PREPROCESSING
# ==========================================================
def preprocess_image(image_bytes: bytes) -> bytes:
    """
    Improves OCR accuracy by enhancing contrast & removing noise
    """
    np_img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Increase contrast
    thresh = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        15
    )

    # Remove noise
    denoised = cv2.medianBlur(thresh, 3)

    # Convert back to bytes
    pil_img = Image.fromarray(denoised)
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")

    return buffer.getvalue()


# ==========================================================
# GOOGLE VISION OCR
# ==========================================================
def google_vision_ocr(image_bytes: bytes) -> str:
    image = vision.Image(content=image_bytes)

    image_context = ImageContext(
        language_hints=["en"]  # Add "ta" if needed
    )

    response = vision_client.document_text_detection(
        image=image,
        image_context=image_context
    )

    if response.error.message:
        raise RuntimeError(response.error.message)

    if not response.full_text_annotation:
        return ""

    return response.full_text_annotation.text


# ==========================================================
# MAIN OCR PIPELINE
# ==========================================================
async def process_bill_ocr(file):
    raw_bytes = await file.read()   # ✅ CORRECT WAY

    if not raw_bytes:
        raise ValueError("Uploaded file is empty")

    # 1️⃣ Preprocess
    # processed_bytes = preprocess_image(raw_bytes)

    # 2️⃣ OCR
    raw_text = google_vision_ocr(raw_bytes)

    # 3️⃣ Cleanup
    cleaned_text = clean_mobile_ocr(raw_text)

    # 4️⃣ Parse
    items = parse_mobile_bill(cleaned_text)

    return {
        "success": True,
        "raw_text": raw_text,
        "cleaned_text": cleaned_text,
        "items": items
    }