from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_actor_mobile, require_auth
from app.core.database import people_collection
from app.schemas.split import (
    ContactCreateRequest,
    ContactEnsureRequest,
    ContactInviteAcceptRequest,
)
from app.services.contact_service import (
    create_contact_invite,
    ensure_saved_contact,
    find_contact_invite,
    normalize_phone,
    person_full_name,
    upsert_saved_contact,
)
from app.services.profile_service import get_user_profile
from app.services.split_settlement_service import phones_match
from app.utils.audit_helpers import audit_event
from app.utils.mongo import serialize_docs

router = APIRouter(tags=["Contacts"])


def _contact_payload(doc: dict) -> dict:
    firstname = str(doc.get("firstname") or "").strip()
    lastname = str(doc.get("lastname") or "").strip()
    return {
        "id": str(doc.get("_id")),
        "_id": str(doc.get("_id")),
        "firstname": firstname,
        "lastname": lastname,
        "name": person_full_name(doc),
        "phone": doc.get("phone"),
        "source": "saved",
    }


@router.post("/add-contacts")
def add_contacts(
    contact: ContactCreateRequest,
    _: Optional[str] = Depends(require_auth),
):
    saved = upsert_saved_contact(
        contact.phone,
        firstname=contact.firstname,
        lastname=contact.lastname,
    )
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
    return {"success": True, "contacts": contacts, "contact": saved}


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


@router.post("/contact-invite/create")
def create_invite(
    actor_mobile: Optional[str] = Depends(get_actor_mobile),
    _: Optional[str] = Depends(require_auth),
):
    if not actor_mobile:
        raise HTTPException(status_code=401, detail="Sign in to create an invite")

    profile = get_user_profile(actor_mobile)
    invite = create_contact_invite(
        actor_mobile,
        firstname=profile.get("firstname") or "",
        lastname=profile.get("lastname") or "",
    )
    name = person_full_name(profile) or "AllSplit User"
    deeplink = f"allsplit://join-contact?t={invite['token']}"
    audit_event(
        action="contact.invite_create",
        category="contact",
        status="success",
        message="Contact invite created",
        actor_mobile=actor_mobile,
        details={"token_suffix": invite["token"][-6:]},
    )
    return {
        "success": True,
        "token": invite["token"],
        "deeplink": deeplink,
        "expires_at": invite["expires_at"].isoformat() + "Z",
        "inviter": {
            "phone": normalize_phone(actor_mobile),
            "firstname": profile.get("firstname") or "",
            "lastname": profile.get("lastname") or "",
            "name": name,
        },
    }


@router.post("/contact-invite/accept")
def accept_invite(
    data: ContactInviteAcceptRequest,
    actor_mobile: Optional[str] = Depends(get_actor_mobile),
    _: Optional[str] = Depends(require_auth),
):
    inviter_mobile = ""
    firstname = (data.firstname or "").strip()
    lastname = (data.lastname or "").strip()

    if data.token:
        invite = find_contact_invite(data.token)
        if not invite:
            raise HTTPException(status_code=404, detail="Invite expired or not found")
        inviter_mobile = invite.get("inviter_mobile") or ""
        firstname = firstname or invite.get("firstname") or ""
        lastname = lastname or invite.get("lastname") or ""
    elif data.phone:
        inviter_mobile = normalize_phone(data.phone)
    else:
        raise HTTPException(status_code=400, detail="Invite token or phone is required")

    if not inviter_mobile:
        raise HTTPException(status_code=400, detail="Could not resolve invite contact")

    if actor_mobile and phones_match(inviter_mobile, actor_mobile):
        raise HTTPException(status_code=400, detail="That's your own invite QR")

    profile = get_user_profile(inviter_mobile)
    firstname = firstname or profile.get("firstname") or ""
    lastname = lastname or profile.get("lastname") or ""

    contact = upsert_saved_contact(
        inviter_mobile,
        firstname=firstname,
        lastname=lastname,
    )
    if not contact:
        raise HTTPException(status_code=400, detail="Could not save this contact")

    if actor_mobile:
        actor_profile = get_user_profile(actor_mobile)
        upsert_saved_contact(
            actor_mobile,
            firstname=actor_profile.get("firstname") or "",
            lastname=actor_profile.get("lastname") or "",
        )

    audit_event(
        action="contact.invite_accept",
        category="contact",
        status="success",
        message="Contact invite accepted",
        actor_mobile=actor_mobile,
        details={"inviter_mobile": inviter_mobile},
    )
    return {
        "success": True,
        "contact": _contact_payload(contact),
        "contacts": serialize_docs(list(people_collection.find({}))),
    }
