from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class MyOweListRequest(BaseModel):
    device_id: str


class CloseBillRequest(BaseModel):
    id: str
    participant_name: Optional[str] = None
    person_id: Optional[str] = None


class MarkSettledRequest(BaseModel):
    id: str
    person_id: str


class CreatedSplitsListRequest(BaseModel):
    device_id: str


class UpdatePriceRequest(BaseModel):
    id: str
    item_id: str
    amount: float
    person_id: str
    qty: int
    unit_price: float


class ContactCreateRequest(BaseModel):
    firstname: str
    lastname: str
    phone: str


class ContactEnsureRequest(BaseModel):
    phone: str
    firstname: str = "Me"
    lastname: str = "User"


class SaveSplitRequest(BaseModel):
    """Accepts flexible split payloads from the mobile client."""

    model_config = {"extra": "allow"}

    people: Optional[List[Dict[str, Any]]] = None
    items: Optional[List[Dict[str, Any]]] = None
    consolidated: Optional[Dict[str, Any]] = None
