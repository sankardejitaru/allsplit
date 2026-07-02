from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Admin"])

_STATIC_DIR = Path(__file__).resolve().parents[3] / "static"


@router.get("/admin/audit-logs", response_class=HTMLResponse, include_in_schema=False)
def audit_logs_admin_page():
    html_path = _STATIC_DIR / "audit_logs.html"
    return HTMLResponse(html_path.read_text(encoding="utf-8"))
