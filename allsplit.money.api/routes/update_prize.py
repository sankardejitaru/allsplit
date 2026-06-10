from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from core.database import split_collection as SplitCollection

router = APIRouter()

class ItemUpdate(BaseModel):
    id: str
    item_id: str
    amount: float                # MongoDB document _id (string)
    person_id: str
    qty: int
    unit_price: float

@router.post("/update-price")
def update_price(update: ItemUpdate):
    
    query = {"_id": ObjectId(update.id)}

    update_op = {
        "$set": {
            "items.$[item].consumption.consumers.$[consumer].person_id": update.person_id,
            "items.$[item].consumption.consumers.$[consumer].amount": update.amount,
            "items.$[item].consumption.consumers.$[consumer].qty": update.qty,
            "items.$[item].consumption.consumers.$[consumer].unit_price": update.unit_price,
        }
    }
    
    array_filters = [
        {"item.id": {"$eq": update.item_id}},          # match the item
        {"consumer.person_id": {"$eq": update.person_id}}  # match the consumer
    ]

    result = SplitCollection.update_one(query, update_op, array_filters=array_filters)

    

    updated_doc = SplitCollection.find_one({"_id": ObjectId(update.id)})
    if updated_doc:
        updated_doc["_id"] = str(updated_doc["_id"])  # serialize ObjectId

    return {
        "success": True,
        "message": "Price updated successfully",
        "updated_doc": updated_doc
    }