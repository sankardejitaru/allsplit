import asyncio
import logging
from typing import Any, Dict

from fastapi import UploadFile

from app.core.config import get_settings
from app.services.bill.bill_items_parser import extract_items_from_text

logger = logging.getLogger(__name__)
_client = None


def _get_textract_client():
    global _client
    if _client is not None:
        return _client

    import boto3

    settings = get_settings()
    client_kwargs = {"region_name": settings.aws_region}

    if settings.aws_access_key_id and settings.aws_secret_access_key:
        client_kwargs["aws_access_key_id"] = settings.aws_access_key_id
        client_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

    _client = boto3.client("textract", **client_kwargs)
    return _client


def _run_textract_sync(img_bytes: bytes) -> Dict[str, Any]:
    client = _get_textract_client()
    response = client.detect_document_text(Document={"Bytes": img_bytes})

    lines = [
        block["Text"]
        for block in response.get("Blocks", [])
        if block.get("BlockType") == "LINE"
    ]

    text = "\n".join(lines)
    items, parse_meta = extract_items_from_text(text)

    logger.info(
        "Textract parsed %s items using %s (header_detected=%s)",
        len(items),
        parse_meta.get("strategy"),
        parse_meta.get("header_detected"),
    )

    return {
        "items": items,
        "parse_meta": parse_meta,
        "source": "textract",
    }


async def run_textract(file: UploadFile):
    img_bytes = await file.read()

    if not img_bytes:
        raise ValueError("Uploaded file is empty")

    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _run_textract_sync, img_bytes)
