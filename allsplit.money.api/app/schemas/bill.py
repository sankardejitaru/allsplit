from typing import List, Optional

from pydantic import BaseModel


class BillItem(BaseModel):
    item: str
    qty: int
    rate: Optional[float] = None
    amount: Optional[float] = None


class Bill(BaseModel):
    items: List[BillItem]
