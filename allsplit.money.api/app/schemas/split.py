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


class ReopenShareRequest(BaseModel):
    id: str
    person_id: str


class UpdateSplitNameRequest(BaseModel):
    id: str
    split_name: str = Field(..., min_length=1, max_length=120)


class UpdateSplitRequest(BaseModel):
    id: str
    split_name: str = Field(..., min_length=1, max_length=120)
    people: List[Dict[str, Any]] = Field(default_factory=list)
    items: List[Dict[str, Any]] = Field(default_factory=list)
    bill_summary: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None


class CreatedSplitsListRequest(BaseModel):
    device_id: str


class UpdatePriceRequest(BaseModel):
    id: str
    item_id: str
    amount: float
    person_id: str
    qty: float
    unit_price: float


class ContactCreateRequest(BaseModel):
    firstname: str
    lastname: str
    phone: str


class ContactEnsureRequest(BaseModel):
    phone: str
    firstname: str = "Me"
    lastname: str = "User"


class ContactInviteAcceptRequest(BaseModel):
    token: Optional[str] = None
    phone: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None


class SendReminderRequest(BaseModel):
    id: str
    person_id: Optional[str] = None


class SaveSplitRequest(BaseModel):
    """Accepts flexible split payloads from the mobile client."""

    model_config = {"extra": "allow"}

    people: Optional[List[Dict[str, Any]]] = None
    items: Optional[List[Dict[str, Any]]] = None
    consolidated: Optional[Dict[str, Any]] = None
