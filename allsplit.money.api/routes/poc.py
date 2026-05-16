from fastapi import APIRouter
from core.database import otp_collection as otps
from bson import ObjectId

router = APIRouter()

def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])  # convert ObjectId to string
    return doc

@router.get("/poc", tags=["POC"], summary="Fetch OTPs from DB")
def poc():
    cursor = otps.delete_many({})
    # delete otps.delete_many({})  # TEMP for testing

    data = [serialize_doc(doc) for doc in cursor]  # convert to list + serialize
    return {
        "success": True,
        "data": data,
        "message": "POC route working"
    }
