from datetime import datetime
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_actor_mobile, require_auth
from app.core.database import split_collection, users_collection
from app.schemas.split import (
    CloseBillRequest,
    CreatedSplitsListRequest,
    MarkSettledRequest,
    MyOweListRequest,
    ReopenShareRequest,
    SaveSplitRequest,
    UpdatePriceRequest,
)
from app.services.notification_service import notify_split_participants
from app.services.split_settlement_service import (
    derive_bill_settlement_status,
    filter_created_splits,
    find_person_by_id,
    find_person_by_name,
    get_creator_mobile,
    get_person_owe_amount,
    get_person_settlement,
    is_split_creator,
    phones_match,
)
from app.utils.audit_helpers import audit_event
from app.utils.mongo import serialize_doc, serialize_docs

router = APIRouter(tags=["Splits"])


@router.post("/save-split")
async def save_split(
    data: SaveSplitRequest,
    _: Optional[str] = Depends(require_auth),
):
    try:
        payload: Dict[str, Any] = data.model_dump(exclude_none=True)
        result = split_collection.insert_one(payload)
        inserted_id = str(result.inserted_id)

        creator_mobile = payload.get("meta", {}).get("creator_mobile")
        notification_result = notify_split_participants(payload, creator_mobile)

        audit_event(
            action="split.save",
            category="split",
            status="success",
            message="Split saved successfully",
            actor_mobile=creator_mobile,
            device_id=payload.get("meta", {}).get("device_id"),
            resource_type="split",
            resource_id=inserted_id,
            details={
                "people_count": len(payload.get("people", [])),
                "items_count": len(payload.get("items", [])),
                "notifications": notification_result,
            },
        )
        return {
            "status": True,
            "message": "Split saved successfully",
            "inserted_id": inserted_id,
            "notifications": notification_result,
        }
    except Exception as exc:
        audit_event(
            action="split.save",
            category="split",
            status="failure",
            message=str(exc),
            actor_mobile=(data.model_dump() or {}).get("meta", {}).get("creator_mobile"),
        )
        return {
            "status": False,
            "message": str(exc),
        }


@router.post("/my-owe-list")
def get_my_owe_list(
    data: MyOweListRequest,
    _: Optional[str] = Depends(require_auth),
):
    user = users_collection.find_one({"device_Id": data.device_id})
    mobile_no = user.get("mobile") if user else None

    if not mobile_no:
        audit_event(
            action="split.my_owe_list",
            category="split",
            status="failure",
            message="User not found for device",
            device_id=data.device_id,
        )
        return {
            "status": False,
            "message": "device_id required or user not found",
        }

    cursor = split_collection.find({"people.phone": mobile_no})
    devices = serialize_docs(list(cursor))

    audit_event(
        action="split.my_owe_list",
        category="split",
        status="success",
        message="Fetched owe list",
        actor_mobile=mobile_no,
        device_id=data.device_id,
        details={"count": len(devices)},
    )
    return {"total": len(devices), "data": devices, "user_mobile": mobile_no}


def _resolve_mobile_from_device(device_id: str, actor_mobile: Optional[str]) -> Optional[str]:
    user = users_collection.find_one({"device_Id": device_id})
    mobile_no = user.get("mobile") if user else None
    return mobile_no or actor_mobile


@router.post("/created-splits-list")
def get_created_splits_list(
    data: CreatedSplitsListRequest,
    actor_mobile: Optional[str] = Depends(get_actor_mobile),
):
    mobile_no = _resolve_mobile_from_device(data.device_id, actor_mobile)

    if not mobile_no:
        audit_event(
            action="split.created_splits_list",
            category="split",
            status="failure",
            message="User not found for device",
            device_id=data.device_id,
        )
        return {
            "status": False,
            "message": "device_id required or user not found",
        }

    all_splits = serialize_docs(list(split_collection.find({})))
    created_splits = filter_created_splits(all_splits, mobile_no)

    for split_doc in created_splits:
        split_doc["bill_settlement_status"] = derive_bill_settlement_status(
            split_doc.get("people") or [],
            get_creator_mobile(split_doc),
        )

    audit_event(
        action="split.created_splits_list",
        category="split",
        status="success",
        message="Fetched created splits list",
        actor_mobile=mobile_no,
        device_id=data.device_id,
        details={"count": len(created_splits)},
    )
    return {
        "total": len(created_splits),
        "data": created_splits,
        "user_mobile": mobile_no,
    }


@router.post("/update-price")
def update_price(
    update: UpdatePriceRequest,
    _: Optional[str] = Depends(require_auth),
):
    try:
        query = {"_id": ObjectId(update.id)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid document ID") from exc

    update_op = {
        "$set": {
            "items.$[item].consumption.consumers.$[consumer].person_id": update.person_id,
            "items.$[item].consumption.consumers.$[consumer].amount": update.amount,
            "items.$[item].consumption.consumers.$[consumer].qty": update.qty,
            "items.$[item].consumption.consumers.$[consumer].unit_price": update.unit_price,
        }
    }

    array_filters = [
        {"item.id": {"$eq": update.item_id}},
        {"consumer.person_id": {"$eq": update.person_id}},
    ]

    split_collection.update_one(query, update_op, array_filters=array_filters)

    updated_doc = split_collection.find_one(query)
    if updated_doc:
        updated_doc = serialize_doc(updated_doc)

    audit_event(
        action="split.update_price",
        category="split",
        status="success",
        message="Price updated",
        resource_type="split",
        resource_id=update.id,
        details={
            "item_id": update.item_id,
            "person_id": update.person_id,
            "amount": update.amount,
            "qty": update.qty,
        },
    )
    return {
        "success": True,
        "message": "Price updated successfully",
        "updated_doc": updated_doc,
    }


@router.post("/close-bill")
def close_bill(
    update: CloseBillRequest,
    actor_mobile: Optional[str] = Depends(get_actor_mobile),
):
    if not update.person_id and not update.participant_name:
        raise HTTPException(
            status_code=400,
            detail="person_id or participant_name is required",
        )

    try:
        query = {"_id": ObjectId(update.id)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid document ID") from exc

    document = split_collection.find_one(query)
    if not document:
        audit_event(
            action="split.close_bill",
            category="split",
            status="failure",
            message="Document not found",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
        )
        raise HTTPException(status_code=404, detail="Document not found")

    target_person = (
        find_person_by_id(document.get("people") or [], update.person_id)
        if update.person_id
        else find_person_by_name(document.get("people") or [], update.participant_name or "")
    )

    if not target_person:
        audit_event(
            action="split.close_bill",
            category="split",
            status="failure",
            message="Participant not found on bill",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={
                "person_id": update.person_id,
                "participant_name": update.participant_name,
            },
        )
        raise HTTPException(status_code=404, detail="Participant not found on bill")

    if actor_mobile and not phones_match(target_person.get("phone"), actor_mobile):
        audit_event(
            action="split.close_bill",
            category="split",
            status="failure",
            message="Participant can only close their own share",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": target_person.get("id")},
        )
        raise HTTPException(
            status_code=403,
            detail="You can only close your own share on this bill",
        )

    if target_person.get("status") == "closed":
        audit_event(
            action="split.close_bill",
            category="split",
            status="failure",
            message="Participant share already closed",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": target_person.get("id")},
        )
        raise HTTPException(status_code=400, detail="Share is already closed")

    people_filter = (
        {"person.id": {"$eq": update.person_id}}
        if update.person_id
        else {"person.name": {"$eq": update.participant_name}}
    )

    now = datetime.utcnow()
    people_result = split_collection.update_one(
        query,
        {
            "$set": {
                "people.$[person].status": "closed",
                "people.$[person].settlement": "pending",
                "people.$[person].closed_at": now,
            },
            "$unset": {
                "people.$[person].reopened_at": "",
                "people.$[person].reopened_by": "",
            },
        },
        array_filters=[people_filter],
    )

    consolidated_result = None
    if update.participant_name and document.get("consolidated", {}).get("participants"):
        consolidated_result = split_collection.update_one(
            query,
            {
                "$set": {
                    "consolidated.participants.$[p].status": "closed",
                    "consolidated.participants.$[p].settlement": "pending",
                }
            },
            array_filters=[{"p.name": {"$eq": update.participant_name}}],
        )

    if people_result.matched_count == 0 and (
        consolidated_result is None or consolidated_result.matched_count == 0
    ):
        raise HTTPException(status_code=404, detail="Participant not found on bill")

    updated_doc = split_collection.find_one(query)
    if updated_doc:
        updated_doc = serialize_doc(updated_doc)
        updated_doc["bill_settlement_status"] = derive_bill_settlement_status(
            updated_doc.get("people") or [],
            get_creator_mobile(updated_doc),
        )

    owe_amount = get_person_owe_amount(document, target_person.get("id"))

    audit_event(
        action="split.close_bill",
        category="split",
        status="success",
        message="Participant closed their share; awaiting creator settlement",
        actor_mobile=actor_mobile or target_person.get("phone"),
        resource_type="split",
        resource_id=update.id,
        details={
            "person_id": target_person.get("id"),
            "participant_name": target_person.get("name"),
            "settlement": "pending",
            "owe_amount": owe_amount,
            "creator_mobile": get_creator_mobile(document),
        },
    )
    return {
        "success": True,
        "status_code": 200,
        "message": "Share closed. Waiting for creator to confirm payment.",
        "updated_doc": updated_doc,
    }


@router.post("/mark-settled")
def mark_settled(
    update: MarkSettledRequest,
    actor_mobile: Optional[str] = Depends(get_actor_mobile),
):
    try:
        query = {"_id": ObjectId(update.id)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid document ID") from exc

    document = split_collection.find_one(query)
    if not document:
        audit_event(
            action="split.mark_settled",
            category="split",
            status="failure",
            message="Document not found",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
        )
        raise HTTPException(status_code=404, detail="Document not found")

    if not is_split_creator(document, actor_mobile):
        audit_event(
            action="split.mark_settled",
            category="split",
            status="failure",
            message="Only the bill creator can mark payment as received",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(
            status_code=403,
            detail="Only the bill creator can mark participants as settled",
        )

    target_person = find_person_by_id(document.get("people") or [], update.person_id)
    if not target_person:
        audit_event(
            action="split.mark_settled",
            category="split",
            status="failure",
            message="Participant not found on bill",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(status_code=404, detail="Participant not found on bill")

    if phones_match(target_person.get("phone"), get_creator_mobile(document)):
        audit_event(
            action="split.mark_settled",
            category="split",
            status="failure",
            message="Creator cannot mark their own share as settled",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(
            status_code=400,
            detail="Creator cannot mark their own share as settled",
        )

    if target_person.get("status") != "closed":
        audit_event(
            action="split.mark_settled",
            category="split",
            status="failure",
            message="Participant has not closed their share yet",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(
            status_code=400,
            detail="Participant must close their share before settlement",
        )

    if get_person_settlement(target_person) == "settled":
        audit_event(
            action="split.mark_settled",
            category="split",
            status="failure",
            message="Participant already marked as settled",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(status_code=400, detail="Participant is already settled")

    now = datetime.utcnow()
    split_collection.update_one(
        query,
        {
            "$set": {
                "people.$[person].settlement": "settled",
                "people.$[person].settled_at": now,
                "people.$[person].settled_by": actor_mobile,
            }
        },
        array_filters=[{"person.id": {"$eq": update.person_id}}],
    )

    updated_doc = split_collection.find_one(query)
    if updated_doc:
        updated_doc = serialize_doc(updated_doc)
        bill_status = derive_bill_settlement_status(
            updated_doc.get("people") or [],
            get_creator_mobile(updated_doc),
        )
        updated_doc["bill_settlement_status"] = bill_status
        split_collection.update_one(
            query,
            {"$set": {"meta.bill_settlement_status": bill_status}},
        )

    owe_amount = get_person_owe_amount(document, update.person_id)

    audit_event(
        action="split.mark_settled",
        category="split",
        status="success",
        message="Creator confirmed payment received",
        actor_mobile=actor_mobile,
        resource_type="split",
        resource_id=update.id,
        details={
            "person_id": update.person_id,
            "participant_name": target_person.get("name"),
            "participant_mobile": target_person.get("phone"),
            "settlement": "settled",
            "owe_amount": owe_amount,
            "bill_settlement_status": updated_doc.get("bill_settlement_status"),
        },
    )
    return {
        "success": True,
        "message": "Payment marked as received",
        "updated_doc": updated_doc,
    }


@router.post("/reopen-share")
def reopen_share(
    update: ReopenShareRequest,
    actor_mobile: Optional[str] = Depends(get_actor_mobile),
):
    try:
        query = {"_id": ObjectId(update.id)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid document ID") from exc

    document = split_collection.find_one(query)
    if not document:
        audit_event(
            action="split.reopen_share",
            category="split",
            status="failure",
            message="Document not found",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
        )
        raise HTTPException(status_code=404, detail="Document not found")

    if not is_split_creator(document, actor_mobile):
        audit_event(
            action="split.reopen_share",
            category="split",
            status="failure",
            message="Only the bill creator can reopen a participant share",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(
            status_code=403,
            detail="Only the bill creator can reopen participant shares",
        )

    target_person = find_person_by_id(document.get("people") or [], update.person_id)
    if not target_person:
        audit_event(
            action="split.reopen_share",
            category="split",
            status="failure",
            message="Participant not found on bill",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(status_code=404, detail="Participant not found on bill")

    if phones_match(target_person.get("phone"), get_creator_mobile(document)):
        audit_event(
            action="split.reopen_share",
            category="split",
            status="failure",
            message="Creator cannot reopen their own share",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(
            status_code=400,
            detail="Creator cannot reopen their own share",
        )

    if target_person.get("status") != "closed":
        audit_event(
            action="split.reopen_share",
            category="split",
            status="failure",
            message="Participant share is not closed",
            actor_mobile=actor_mobile,
            resource_type="split",
            resource_id=update.id,
            details={"person_id": update.person_id},
        )
        raise HTTPException(
            status_code=400,
            detail="Participant share is not closed",
        )

    previous_settlement = get_person_settlement(target_person)
    now = datetime.utcnow()
    people_filter = {"person.id": {"$eq": update.person_id}}

    split_collection.update_one(
        query,
        {
            "$set": {
                "people.$[person].status": "open",
                "people.$[person].reopened_at": now,
                "people.$[person].reopened_by": actor_mobile,
            },
            "$unset": {
                "people.$[person].settlement": "",
                "people.$[person].closed_at": "",
                "people.$[person].settled_at": "",
                "people.$[person].settled_by": "",
            },
        },
        array_filters=[people_filter],
    )

    if target_person.get("name") and document.get("consolidated", {}).get("participants"):
        split_collection.update_one(
            query,
            {
                "$set": {
                    "consolidated.participants.$[p].status": "open",
                },
                "$unset": {
                    "consolidated.participants.$[p].settlement": "",
                },
            },
            array_filters=[{"p.name": {"$eq": target_person.get("name")}}],
        )

    updated_doc = split_collection.find_one(query)
    if updated_doc:
        updated_doc = serialize_doc(updated_doc)
        bill_status = derive_bill_settlement_status(
            updated_doc.get("people") or [],
            get_creator_mobile(updated_doc),
        )
        updated_doc["bill_settlement_status"] = bill_status
        split_collection.update_one(
            query,
            {"$set": {"meta.bill_settlement_status": bill_status}},
        )

    owe_amount = get_person_owe_amount(document, update.person_id)

    audit_event(
        action="split.reopen_share",
        category="split",
        status="success",
        message="Creator reopened participant share for reconsideration",
        actor_mobile=actor_mobile,
        resource_type="split",
        resource_id=update.id,
        details={
            "person_id": update.person_id,
            "participant_name": target_person.get("name"),
            "participant_mobile": target_person.get("phone"),
            "previous_settlement": previous_settlement,
            "owe_amount": owe_amount,
            "bill_settlement_status": updated_doc.get("bill_settlement_status"),
        },
    )
    return {
        "success": True,
        "message": "Share reopened. Participant can review and close again.",
        "updated_doc": updated_doc,
    }
