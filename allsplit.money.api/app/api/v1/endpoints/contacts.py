from typing import Optional

from fastapi import APIRouter, Depends

from app.api.deps import require_auth
from app.core.database import people_collection
from app.schemas.split import ContactCreateRequest, ContactEnsureRequest
from app.services.contact_service import ensure_saved_contact, normalize_phone
from app.utils.audit_helpers import audit_event
from app.utils.mongo import serialize_docs

router = APIRouter(tags=["Contacts"])


@router.post("/add-contacts")
def add_contacts(
    contact: ContactCreateRequest,
    _: Optional[str] = Depends(require_auth),
):
    latest = people_collection.find_one(sort=[("_id", -1)])
    next_id = str(int(latest["_id"]) + 1) if latest else "1"

    people_collection.insert_one({
        "_id": next_id,
        "firstname": contact.firstname,
        "lastname": contact.lastname,
        "phone": normalize_phone(contact.phone),
    })

    contacts = serialize_docs(list(people_collection.find({})))
    audit_event(
        action="contact.add",
        category="contact",
        status="success",
        message="Contact added",
        details={
            "firstname": contact.firstname,
            "lastname": contact.lastname,
            "phone": normalize_phone(contact.phone),
        },
    )
    return {"success": True, "contacts": contacts}


@router.get("/get-contacts")
def get_contacts(_: Optional[str] = Depends(require_auth)):
    contacts = serialize_docs(list(people_collection.find({})))
    return {"contacts": contacts}


@router.post("/ensure-self-contact")
def ensure_self_contact(
    contact: ContactEnsureRequest,
    _: Optional[str] = Depends(require_auth),
):
    created = ensure_saved_contact(
        contact.phone,
        firstname=contact.firstname,
        lastname=contact.lastname,
    )
    contacts = serialize_docs(list(people_collection.find({})))
    audit_event(
        action="contact.ensure_self",
        category="contact",
        status="success",
        message="Self contact ensured",
        actor_mobile=contact.phone,
        details={"created": created},
    )
    return {
        "success": True,
        "created": created,
        "contacts": contacts,
    }
