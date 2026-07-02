from datetime import datetime
from typing import Any, Dict, List, Optional

from app.services.contact_service import normalize_phone


def phones_match(phone_a: Optional[str], phone_b: Optional[str]) -> bool:
    a = normalize_phone(phone_a or "")
    b = normalize_phone(phone_b or "")

    if not a or not b:
        return False

    if a == b:
        return True

    return a[-10:] == b[-10:]


def find_person_by_id(people: List[Dict[str, Any]], person_id: str) -> Optional[Dict[str, Any]]:
    for person in people or []:
        if person.get("id") == person_id:
            return person
    return None


def find_person_by_name(people: List[Dict[str, Any]], name: str) -> Optional[Dict[str, Any]]:
    for person in people or []:
        if person.get("name") == name:
            return person
    return None


def get_creator_mobile(split_doc: Dict[str, Any]) -> Optional[str]:
    return (split_doc.get("meta") or {}).get("creator_mobile")


def is_split_creator(split_doc: Dict[str, Any], actor_mobile: Optional[str]) -> bool:
    creator_mobile = get_creator_mobile(split_doc)
    if not creator_mobile or not actor_mobile:
        return False
    return phones_match(creator_mobile, actor_mobile)


def get_person_settlement(person: Dict[str, Any]) -> Optional[str]:
    if person.get("status") != "closed":
        return None
    return person.get("settlement") or "pending"


def derive_bill_settlement_status(
    people: List[Dict[str, Any]],
    creator_mobile: Optional[str] = None,
) -> str:
    participants = people or []

    if not participants:
        return "active"

    if creator_mobile:
        bill_people = [
            person
            for person in participants
            if not phones_match(person.get("phone"), creator_mobile)
        ]
    else:
        bill_people = participants

    if not bill_people:
        return "fully_settled"

    if any(person.get("status") != "closed" for person in bill_people):
        if any(get_person_settlement(person) == "pending" for person in bill_people):
            return "awaiting_settlement"
        return "active"

    if all(get_person_settlement(person) == "settled" for person in bill_people):
        return "fully_settled"

    return "awaiting_settlement"


def get_person_owe_amount(split_doc: Dict[str, Any], person_id: str) -> float:
    total = 0.0

    for item in split_doc.get("items") or []:
        for consumer in (item.get("consumption") or {}).get("consumers") or []:
            if consumer.get("person_id") == person_id:
                total += float(consumer.get("amount") or 0)

    return round(total, 2)


def filter_created_splits(
    splits: List[Dict[str, Any]],
    creator_mobile: str,
) -> List[Dict[str, Any]]:
    return [
        split_doc
        for split_doc in splits
        if is_split_creator(split_doc, creator_mobile)
    ]
