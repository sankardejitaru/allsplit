import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import require_auth
from app.services.textract_service import run_textract
from app.utils.audit_helpers import audit_event

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/textract", tags=["Textract"])


@router.post("/scan")
async def scan_bill(
    file: UploadFile = File(...),
    _: Optional[str] = Depends(require_auth),
):
    try:
        result = await run_textract(file)
        audit_event(
            action="scan.textract",
            category="scan",
            status="success",
            message="Bill scanned via Textract",
            details={
                "filename": file.filename,
                "items_count": len(result.get("items", [])),
                "parse_strategy": result.get("parse_meta", {}).get("strategy"),
                "header_detected": result.get("parse_meta", {}).get("header_detected"),
            },
        )
        return {
            "success": len(result.get("items", [])) > 0,
            "message": (
                "Bill scanned successfully"
                if result.get("items")
                else "Could not detect line items. Try a clearer photo."
            ),
            **result,
        }
    except Exception as exc:
        logger.exception("Textract scan failed")
        audit_event(
            action="scan.textract",
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
