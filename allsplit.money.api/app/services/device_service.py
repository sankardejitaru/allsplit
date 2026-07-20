from datetime import datetime
from typing import Optional

from app.core.database import users_collection


def find_user_by_device(device_id: str) -> Optional[dict]:
    if not device_id:
        return None

    return users_collection.find_one(
        {"device_Id": device_id},
        sort=[("last_login", -1)],
    )


def unlink_device(device_id: str) -> int:
    if not device_id:
        return 0

    result = users_collection.update_many(
        {"device_Id": device_id},
        {"$unset": {"device_Id": ""}},
    )
    return result.modified_count


def bind_device_to_mobile(mobile: str, device_id: str) -> None:
    if not mobile or not device_id:
        return

    unlink_device(device_id)
    users_collection.update_one(
        {"mobile": mobile},
        {"$set": {
            "device_Id": device_id,
            "last_login": datetime.utcnow(),
        }},
    )
