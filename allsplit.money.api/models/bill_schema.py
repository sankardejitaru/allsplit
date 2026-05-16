from pydantic import BaseModel
from typing import List, Optional


class BillItem(BaseModel):
    item: str
    qty: int
    rate: Optional[float]
    amount: Optional[float]


class Bill(BaseModel):
    items: List[BillItem]