from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AuditLogListRequest(BaseModel):
    mobile: Optional[str] = None
    category: Optional[str] = None
    action: Optional[str] = None
    status: Optional[str] = None
    limit: int = Field(default=50, ge=1, le=200)
    skip: int = Field(default=0, ge=0)


class AuditLogEntry(BaseModel):
    id: str
    timestamp: datetime
    action: str
    category: str
    status: str
    message: str
    method: Optional[str] = None
    path: Optional[str] = None
    actor_mobile: Optional[str] = None
    device_id: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    status_code: Optional[int] = None
    duration_ms: Optional[int] = None
    details: Optional[Dict[str, Any]] = None


class AuditLogListResponse(BaseModel):
    success: bool = True
    total: int
    logs: List[AuditLogEntry]
