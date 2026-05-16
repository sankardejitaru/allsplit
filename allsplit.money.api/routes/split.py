from fastapi import APIRouter
from core.database import split_collection

router = APIRouter()


@router.post("/save-split")
async def save_split(data: dict):

    try:

        # Insert JSON into MongoDB
        result = split_collection.insert_one(data)

        return {
            "status": True,
            "message": "Split saved successfully",
            "inserted_id": str(result.inserted_id)
        }

    except Exception as e:

        return {
            "status": False,
            "message": str(e)
        }