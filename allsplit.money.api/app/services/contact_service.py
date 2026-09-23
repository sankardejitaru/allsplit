import re
import secrets
from datetime import datetime, timedelta
from typing import Optional

from app.core.database import contact_invites_collection, people_collection
from app.utils.mongo import serialize_doc

DEFAULT_COUNTRY_CODE = "91"


def normalize_phone(phone: str) -> str:
    """Normalize to Indian E.164-style digits: 91 + 10-digit mobile."""
    digits = re.sub(r"\D", "", phone or "")
    if not digits:
        return ""

    expected_len = len(DEFAULT_COUNTRY_CODE) + 10

    if digits.startswith(DEFAULT_COUNTRY_CODE) and len(digits) >= expected_len:
        return f"{DEFAULT_COUNTRY_CODE}{digits[-10:]}"

    digits = re.sub(r"^0+", "", digits)

    if digits.startswith(DEFAULT_COUNTRY_CODE) and len(digits) >= expected_len:
        return f"{DEFAULT_COUNTRY_CODE}{digits[-10:]}"

    if len(digits) == 10:
        return f"{DEFAULT_COUNTRY_CODE}{digits}"

    if len(digits) > 10:
        return f"{DEFAULT_COUNTRY_CODE}{digits[-10:]}"

    return ""


def phone_exists(phone: str) -> bool:
    normalized = normalize_phone(phone)
    if not normalized or len(normalized) < 10:
        return False

    last10 = normalized[-10:]

    for doc in people_collection.find({}):
        doc_digits = normalize_phone(doc.get("phone", ""))
        if not doc_digits:
            continue
        if doc_digits == normalized or doc_digits[-10:] == last10:
            return True

    return False


def ensure_saved_contact(
    phone: str,
    firstname: str = "Me",
    lastname: str = "User",
) -> bool:
    """Add phone to saved contacts if not already present. Returns True if created."""
    normalized = normalize_phone(phone)
    if not normalized or len(normalized) != len(DEFAULT_COUNTRY_CODE) + 10:
        return False

    if phone_exists(normalized):
        return False

    latest = people_collection.find_one(sort=[("_id", -1)])
    next_id = str(int(latest["_id"]) + 1) if latest else "1"

    people_collection.insert_one({
        "_id": next_id,
        "firstname": firstname,
        "lastname": lastname,
        "phone": normalized,
    })
    return True


def person_full_name(person: Optional[dict]) -> str:
    if not person:
        return ""
    firstname = str(person.get("firstname") or "").strip()
    lastname = str(person.get("lastname") or "").strip()
    combined = f"{firstname} {lastname}".strip()
    return combined or str(person.get("name") or "").strip()


def find_saved_contact(phone: str) -> Optional[dict]:
    normalized = normalize_phone(phone)
    if not normalized or len(normalized) < 10:
        return None

    last10 = normalized[-10:]
    for doc in people_collection.find({}):
        doc_digits = normalize_phone(doc.get("phone", ""))
        if not doc_digits:
            continue
        if doc_digits == normalized or doc_digits[-10:] == last10:
            return doc
    return None


def _next_people_id() -> str:
    latest = people_collection.find_one(sort=[("_id", -1)])
    return str(int(latest["_id"]) + 1) if latest else "1"


def upsert_saved_contact(
    phone: str,
    firstname: str = "",
    lastname: str = "",
) -> Optional[dict]:
    normalized = normalize_phone(phone)
    if not normalized or len(normalized) != len(DEFAULT_COUNTRY_CODE) + 10:
        return None

    firstname = (firstname or "").strip()
    lastname = (lastname or "").strip()
    existing = find_saved_contact(normalized)

    if existing:
        updates = {}
        if firstname and existing.get("firstname") != firstname:
            updates["firstname"] = firstname
        if lastname and existing.get("lastname") != lastname:
            updates["lastname"] = lastname
        if updates:
            people_collection.update_one({"_id": existing["_id"]}, {"$set": updates})
            existing = {**existing, **updates}
        return serialize_doc(existing)

    next_id = _next_people_id()
    doc = {
        "_id": next_id,
        "firstname": firstname or "AllSplit",
        "lastname": lastname,
        "phone": normalized,
    }
    people_collection.insert_one(doc)
    return serialize_doc(doc)


def create_contact_invite(inviter_mobile: str, firstname: str = "", lastname: str = "") -> dict:
    token = secrets.token_urlsafe(24)
    now = datetime.utcnow()
    invite = {
        "token": token,
        "inviter_mobile": normalize_phone(inviter_mobile),
        "firstname": (firstname or "").strip(),
        "lastname": (lastname or "").strip(),
        "created_at": now,
        "expires_at": now + timedelta(days=30),
    }
    contact_invites_collection.insert_one(invite)
    return invite


def find_contact_invite(token: str) -> Optional[dict]:
    if not token:
        return None
    invite = contact_invites_collection.find_one({"token": token})
    if not invite:
        return None
    expires_at = invite.get("expires_at")
    if expires_at and expires_at < datetime.utcnow():
        return None
    return invite
