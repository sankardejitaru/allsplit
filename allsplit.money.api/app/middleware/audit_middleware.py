import time
from typing import Optional

from fastapi import Request
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings
from app.services.audit_service import SKIP_HTTP_PATHS, record_audit


def _extract_mobile(request: Request) -> Optional[str]:
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        try:
            settings = get_settings()
            payload = jwt.decode(
                auth[7:],
                settings.secret_key,
                algorithms=[settings.jwt_algorithm],
            )
            mobile = payload.get("sub")
            if mobile:
                return mobile
        except JWTError:
            pass

    header_mobile = request.headers.get("x-user-mobile")
    return header_mobile or None


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in SKIP_HTTP_PATHS:
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = int((time.perf_counter() - start) * 1000)
        status = "success" if response.status_code < 400 else "failure"

        record_audit(
            action=f"{request.method} {request.url.path}",
            category="http",
            status=status,
            message=f"{response.status_code} {request.url.path}",
            method=request.method,
            path=request.url.path,
            actor_mobile=_extract_mobile(request),
            status_code=response.status_code,
            duration_ms=duration_ms,
            details={
                "client": request.headers.get("user-agent", "")[:120],
            },
        )

        return response
