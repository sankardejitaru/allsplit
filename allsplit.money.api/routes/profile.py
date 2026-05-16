from fastapi import APIRouter, Depends
from auth.deps import get_current_user

router = APIRouter()

@router.get("/profile")
def profile(mobile: str = Depends(get_current_user)):
    return {
        "success": True,
        "mobile": mobile
    }