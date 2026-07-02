from typing import Optional

from fastapi import APIRouter, Depends

from app.api.deps import require_auth
from app.schemas.audit import AuditLogListRequest
from app.services.audit_service import list_audit_logs

router = APIRouter(tags=["Audit"])


@router.post("/audit-logs/list")
def get_audit_logs(
    data: AuditLogListRequest,
    current_user: Optional[str] = Depends(require_auth),
):
    return list_audit_logs(
        mobile=data.mobile if data.mobile else current_user,
        category=data.category,
        action=data.action,
        status=data.status,
        limit=data.limit,
        skip=data.skip,
    )
