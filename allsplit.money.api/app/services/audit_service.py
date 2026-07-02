import logging
from datetime import datetime
from typing import Any, Dict, Optional

from app.core.database import audit_logs_collection
from app.utils.mongo import serialize_doc

logger = logging.getLogger(__name__)

SENSITIVE_KEYS = {
    "pin",
    "otp",
    "password",
    "access_token",
    "secret",
    "setpin",
    "authorization",
}

SKIP_HTTP_PATHS = {"/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"}


def _sanitize_value(key: str, value: Any) -> Any:
    if key.lower() in SENSITIVE_KEYS:
        return "***"

    if isinstance(value, dict):
        return sanitize_details(value)

    if isinstance(value, list):
        return [_sanitize_value(key, item) for item in value[:20]]

    return value


def sanitize_details(details: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not details:
        return {}

    sanitized: Dict[str, Any] = {}
    for key, value in details.items():
        sanitized[key] = _sanitize_value(key, value)
    return sanitized


def record_audit(
    *,
    action: str,
    category: str,
    status: str = "success",
    message: str = "",
    method: Optional[str] = None,
    path: Optional[str] = None,
    actor_mobile: Optional[str] = None,
    device_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    status_code: Optional[int] = None,
    duration_ms: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    try:
        audit_logs_collection.insert_one({
            "timestamp": datetime.utcnow(),
            "action": action,
            "category": category,
            "status": status,
            "message": message,
            "method": method,
            "path": path,
            "actor_mobile": actor_mobile,
            "device_id": device_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "status_code": status_code,
            "duration_ms": duration_ms,
            "details": sanitize_details(details),
        })
    except Exception as exc:
        logger.warning("Failed to write audit log: %s", exc)


def list_audit_logs(
    *,
    mobile: Optional[str] = None,
    category: Optional[str] = None,
    action: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
) -> Dict[str, Any]:
    query: Dict[str, Any] = {}

    if mobile:
        query["actor_mobile"] = mobile
    if category:
        query["category"] = category
    if action:
        query["action"] = {"$regex": action, "$options": "i"}
    if status:
        query["status"] = status

    total = audit_logs_collection.count_documents(query)
    cursor = (
        audit_logs_collection.find(query)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )

    logs = []
    for doc in cursor:
        serialized = serialize_doc(doc)
        logs.append({
            "id": serialized.get("_id"),
            "timestamp": serialized.get("timestamp"),
            "action": serialized.get("action"),
            "category": serialized.get("category"),
            "status": serialized.get("status"),
            "message": serialized.get("message", ""),
            "method": serialized.get("method"),
            "path": serialized.get("path"),
            "actor_mobile": serialized.get("actor_mobile"),
            "device_id": serialized.get("device_id"),
            "resource_type": serialized.get("resource_type"),
            "resource_id": serialized.get("resource_id"),
            "status_code": serialized.get("status_code"),
            "duration_ms": serialized.get("duration_ms"),
            "details": serialized.get("details") or {},
        })

    return {"success": True, "total": total, "logs": logs}


def ensure_audit_indexes() -> None:
    audit_logs_collection.create_index([("timestamp", -1)])
    audit_logs_collection.create_index([("actor_mobile", 1), ("timestamp", -1)])
    audit_logs_collection.create_index([("category", 1), ("timestamp", -1)])
