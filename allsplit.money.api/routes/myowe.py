
from fastapi import APIRouter
from core.database import split_collection as SplitCollection
from core.database import users_collection as UsersCollection

router = APIRouter()

@router.post("/my-owe-list")
def get_all_devices(data: dict): # Removed 'async' since you aren't awaiting anything
    # 1. Fetch all documents synchronously
    # PyMongo's find() returns a cursor; list() converts it to data
    device_id = data.get("device_id")
    print(device_id)

    if not device_id:
        return {
            "status": False,
            "message": "device_id required"
        }
    
    user = UsersCollection.find_one({"device_Id": device_id})

    if user:
        mobile_no = user.get("mobile")
    else:
        mobile_no = None

    cursor = SplitCollection.find({})
    devices = list(cursor) 

    # 2. Format the data for JSON (Handling ObjectId)
    
    for i, device in enumerate(devices):
        if "_id" in device:
            # Find the matching contact
            contact = next(
                (c for c in device.get("people", []) if c.get("phone") == mobile_no),
                None
            )
            
            if contact:
                # Keep _id as string if contact matches
                device["_id"] = str(device["_id"])
                # device["people"] = (c for c in device.get("people", []) if c.get("phone") == mobile_no)  # Remove people field
                # device["consolidated"]["participants"] = []  # Filter participants
                # items = []                
            else:
                # Replace this device with None if no matching contact
                devices[i] = None
        else:
            # Replace this device with None if it doesn't have an _id field
            devices[i] = None
            

    # 3. Filter out None values
    devices = [d for d in devices if d is not None]

    return {"total": len(devices), "data": devices}
