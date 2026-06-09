from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from core.database import split_collection as SplitCollection

router = APIRouter()

class ItemUpdate(BaseModel):
    id: str                # MongoDB document _id (string)
    participant_name: str   # Participant name to match

@router.post("/close-bill")
def close_bill(update: ItemUpdate):
    # Validate ObjectId
    try:
        query = {"_id": ObjectId(update.id)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid document ID")

    # Check if document exists
    validate_doc = SplitCollection.find_one(query)
    if not validate_doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Update operation
    update_op = {
        "$set": {
            "consolidated.participants.$[p].status": "closed"
        }
    }

    # Array filter to match participant by name
    array_filters = [
        {"p.name": {"$eq": update.participant_name}}
    ]

    # Perform update
    result = SplitCollection.update_one(query, update_op, array_filters=array_filters)

    #if result.modified_count == 0:
        #raise HTTPException(status_code=404, detail="Participant not found or already closed")

    return {
        "success": True,
        "status_code": 200,
        "message": "Bill closed for participant"
    }
