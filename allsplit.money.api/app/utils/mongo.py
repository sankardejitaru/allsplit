from typing import Any, Dict, List

from bson import ObjectId


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc is None:
        return doc
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc = {**doc, "_id": str(doc["_id"])}
    return doc


def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_doc(doc) for doc in docs]
