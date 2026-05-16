from fastapi import APIRouter
from core.database import split_collection as split
from core.database import users_collection

router = APIRouter()


@router.post("/my-owe-list")
def get_my_owe_list(data: dict):

    try:

        # Get device_id from request
        device_id = data.get("device_id")
        print(device_id)

        if not device_id:
            return {
                "status": False,
                "message": "device_id required"
            }

        # Find user by device_id
        user = users_collection.find_one({
            "device_Id": device_id
        })

        if not user:
            return {
                "status": False,
                "message": "User not found"
            }

        mobile = user.get("mobile")

        # Find split documents
        cursor = split.find({
            "contacts.contact": mobile
        })

        split_list = list(cursor)

        response_data = {}

        for doc in split_list:

            # Convert ObjectId
            doc["_id"] = str(doc["_id"])

            total_users = len(doc.get("contacts", []))

            items_master = doc.get("items", [])

            participants = doc.get("consolidated", {}).get("participants", [])

            # Find current participant
            current_participant = None

            for participant in participants:

                if participant.get("contact") == mobile:
                    current_participant = participant
                    break

            if not current_participant:
                continue

            user_items = []
            total_amount = 0

            for participant_item in current_participant.get("items", []):

                item_id = participant_item.get("item_id")

                # Find item details
                matched_item = next(
                    (
                        item for item in items_master
                        if item.get("item_id") == item_id
                    ),
                    None
                )

                if not matched_item:
                    continue

                price = matched_item.get("price", 0)

                quantity = matched_item.get("quantity", 1)

                # Safety conversion
                quantity = int(quantity)

                # Split logic
                if matched_item.get("is_split_equal") == True:

                    final_amount = price / quantity

                else:

                    final_amount = price

                total_amount += final_amount

                user_items = {
                    "item_id": matched_item.get("item_id"),
                    "description": matched_item.get("description"),
                    "quantity": matched_item.get("quantity"),
                    "original_price": price,
                    "payable_amount": final_amount,
                    "is_split_equal": matched_item.get("is_split_equal")
                }

            response_data = {
                "status": True,
                "split_id": doc["_id"],
                "split_name": doc.get("split_name"),
                "mobile": mobile,
                "total_payable": total_amount,
                "items": user_items
            }

        return {
            "status": True,
            "total": len(response_data),
            "data": response_data
        }

    except Exception as e:

        return {
            "status": False,
            "message": 'Exception occured : ' . str(e)
        }