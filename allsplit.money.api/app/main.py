import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.middleware.audit_middleware import AuditMiddleware
from app.services.audit_service import ensure_audit_indexes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(AuditMiddleware)

    @app.on_event("startup")
    def create_audit_indexes():
        ensure_audit_indexes()

    app.include_router(api_router)

    if settings.require_jwt_auth:
        logger.info("JWT authentication is enabled for protected routes")
    else:
        logger.warning(
            "JWT authentication is disabled (REQUIRE_JWT_AUTH=false). "
            "Enable it before production deployment."
        )

    if settings.otp_test_mode:
        logger.warning("OTP test mode is enabled. Disable OTP_TEST_MODE in production.")

    return app


app = create_app()
