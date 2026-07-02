from typing import Optional

from app.core.database import people_collection, users_collection
from app.services.contact_service import ensure_saved_contact, normalize_phone


def find_person_by_phone(mobile: str) -> Optional[dict]:
    normalized = normalize_phone(mobile)
    if not normalized:
        return None

    last10 = normalized[-10:]

    for doc in people_collection.find({}):
        doc_phone = normalize_phone(doc.get("phone", ""))
        if not doc_phone:
            continue
        if doc_phone == normalized or doc_phone[-10:] == last10:
            return doc

    return None


def get_user_profile(mobile: str) -> dict:
    user = users_collection.find_one({"mobile": mobile})
    firstname = (user or {}).get("firstname", "").strip()
    lastname = (user or {}).get("lastname", "").strip()

    if not firstname:
        person = find_person_by_phone(mobile)
        if person:
            firstname = str(person.get("firstname", "")).strip()
            lastname = str(person.get("lastname", "")).strip()

    return {
        "mobile": mobile,
        "firstname": firstname,
        "lastname": lastname,
    }


def update_user_profile(mobile: str, firstname: str, lastname: str) -> dict:
    firstname = firstname.strip()
    lastname = lastname.strip()

    users_collection.update_one(
        {"mobile": mobile},
        {"$set": {"firstname": firstname, "lastname": lastname}},
    )

    person = find_person_by_phone(mobile)
    if person:
        people_collection.update_one(
            {"_id": person["_id"]},
            {"$set": {"firstname": firstname, "lastname": lastname}},
        )
    else:
        ensure_saved_contact(mobile, firstname=firstname, lastname=lastname)

    return get_user_profile(mobile)
