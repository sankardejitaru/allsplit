from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Site"])

_SITE_DIR = Path(__file__).resolve().parents[3] / "static" / "site"

_PAGES = {
    "index": "index.html",
    "privacy": "privacy.html",
    "terms": "terms.html",
    "support": "support.html",
    "delete-account": "delete-account.html",
}


def _read_page(name: str) -> HTMLResponse:
    filename = _PAGES.get(name)
    if not filename:
        raise HTTPException(status_code=404, detail="Page not found")

    path = _SITE_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Page not found")

    return HTMLResponse(path.read_text(encoding="utf-8"))


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
def site_home():
    return _read_page("index")


@router.get("/privacy", response_class=HTMLResponse, include_in_schema=False)
@router.get("/privacy-policy", response_class=HTMLResponse, include_in_schema=False)
def site_privacy():
    return _read_page("privacy")


@router.get("/terms", response_class=HTMLResponse, include_in_schema=False)
@router.get("/terms-of-service", response_class=HTMLResponse, include_in_schema=False)
def site_terms():
    return _read_page("terms")


@router.get("/support", response_class=HTMLResponse, include_in_schema=False)
@router.get("/contact", response_class=HTMLResponse, include_in_schema=False)
def site_support():
    return _read_page("support")


@router.get("/delete-account", response_class=HTMLResponse, include_in_schema=False)
@router.get("/account-deletion", response_class=HTMLResponse, include_in_schema=False)
def site_delete_account():
    return _read_page("delete-account")
