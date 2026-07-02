from typing import Any, Dict, Optional

from app.services.audit_service import record_audit, sanitize_details


def audit_event(
    *,
    action: str,
    category: str,
    status: str = "success",
    message: str = "",
    actor_mobile: Optional[str] = None,
    device_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    record_audit(
        action=action,
        category=category,
        status=status,
        message=message,
        actor_mobile=actor_mobile,
        device_id=device_id,
        resource_type=resource_type,
        resource_id=resource_id,
        details=sanitize_details(details),
    )
