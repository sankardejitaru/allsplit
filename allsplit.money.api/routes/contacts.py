from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from core.database import people_collection as PeopleCollection

router = APIRouter(prefix="", tags=["Contacts"])

class ItemUpdate(BaseModel):
    name: str                # MongoDB document _id (string)
    phone: str   # Participant name to match
@router.post("/add-contacts")
def add_contacts(update: ItemUpdate):
    # Data to insert
    # took latest id and incremented by 1 for new entries, in real scenario you might want to use a more robust method for generating unique IDs
    people_id = PeopleCollection.find_one(sort=[("_id", -1)])["_id"] if PeopleCollection.count_documents({}) > 0 else 0
    people = [
        {
            "_id": str(int(people_id) + 1),   # use _id for MongoDB primary key
            "name": update.name,
            "phone": update.phone
        }
    ]

    # Insert documents
    result = PeopleCollection.insert_many(people)

    # Return inserted IDs
    return {"inserted_ids": [str(_id) for _id in result.inserted_ids]}


@router.get("/get-contacts")
def get_contacts():
    # Fetch all documents
    contacts = list(PeopleCollection.find({}))

    print(contacts)
    # Return contacts
    return {"contacts": contacts}