from typing import Optional

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings

security = HTTPBearer(auto_error=False)


def get_actor_mobile(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_user_mobile: Optional[str] = Header(None, alias="x-user-mobile"),
) -> Optional[str]:
    settings = get_settings()

    if credentials:
        try:
            payload = jwt.decode(
                credentials.credentials,
                settings.secret_key,
                algorithms=[settings.jwt_algorithm],
            )
            mobile = payload.get("sub")
            if mobile:
                return mobile
        except JWTError:
            pass

    if x_user_mobile:
        return x_user_mobile.strip()

    if settings.require_jwt_auth:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    settings = get_settings()

    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        mobile = payload.get("sub")
        if not mobile:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return mobile
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc


def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[str]:
    """Enforces JWT when REQUIRE_JWT_AUTH=true; otherwise allows open access."""
    settings = get_settings()
    if not settings.require_jwt_auth:
        return None
    return get_current_user(credentials)
