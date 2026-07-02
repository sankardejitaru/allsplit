from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, require_auth
from app.schemas.user import ProfileGetRequest, ProfileUpdateRequest
from app.services.profile_service import get_user_profile, update_user_profile
from app.utils.audit_helpers import audit_event

router = APIRouter(tags=["Profile"])


@router.get("/profile")
def profile(mobile: str = Depends(get_current_user)):
    data = get_user_profile(mobile)
    return {
        "success": True,
        **data,
    }


@router.post("/get-profile")
def get_profile(
    data: ProfileGetRequest,
    _: Optional[str] = Depends(require_auth),
):
    profile_data = get_user_profile(data.mobile)
    return {
        "success": True,
        **profile_data,
    }


@router.post("/update-profile")
def update_profile(
    data: ProfileUpdateRequest,
    _: Optional[str] = Depends(require_auth),
):
    if not data.firstname.strip():
        raise HTTPException(status_code=400, detail="First name is required")

    profile_data = update_user_profile(
        data.mobile,
        data.firstname,
        data.lastname,
    )

    audit_event(
        action="profile.update",
        category="profile",
        status="success",
        message="Profile updated",
        actor_mobile=data.mobile,
        details={
            "firstname": profile_data.get("firstname"),
            "lastname": profile_data.get("lastname"),
        },
    )
    return {
        "success": True,
        "message": "Profile updated",
        **profile_data,
    }
