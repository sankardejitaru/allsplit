import re

from app.core.database import people_collection

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
