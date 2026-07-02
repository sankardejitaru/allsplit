from typing import Optional

from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import require_auth
from app.services.ocr_service import process_bill_ocr
from app.utils.audit_helpers import audit_event

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/scan-bill")
async def scan_bill(
    file: UploadFile = File(...),
    _: Optional[str] = Depends(require_auth),
):
    try:
        result = await process_bill_ocr(file)
        audit_event(
            action="scan.ocr",
            category="scan",
            status="success" if result.get("items") else "failure",
            message=result.get("message") or "Bill scanned via OCR",
            details={
                "filename": file.filename,
                "items_count": len(result.get("items", [])),
                "parse_strategy": result.get("parse_meta", {}).get("strategy"),
            },
        )
        return result
    except Exception as exc:
        audit_event(
            action="scan.ocr",
            category="scan",
            status="failure",
            message=str(exc),
            details={"filename": file.filename},
        )
        return {
            "success": False,
            "message": str(exc),
            "items": [],
        }
