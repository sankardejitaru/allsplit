import logging
from typing import Any, Dict, List, Optional

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _mask_mobile(mobile: str) -> str:
    digits = "".join(ch for ch in mobile if ch.isdigit())
    if len(digits) <= 4:
        return digits
    return f"***{digits[-4:]}"


def send_sms(mobile: str, message: str) -> Dict[str, Any]:
    settings = get_settings()
    if not settings.enable_sms:
        logger.info("[SMS disabled] To %s: %s", _mask_mobile(mobile), message[:40])
        return {"sent": False, "channel": "sms", "reason": "disabled"}

    # Placeholder for Twilio / MSG91 / AWS SNS integration.
    logger.warning("[SMS stub] Would send to %s", _mask_mobile(mobile))
    return {"sent": False, "channel": "sms", "reason": "not_configured"}


def send_whatsapp(mobile: str, message: str) -> Dict[str, Any]:
    settings = get_settings()
    if not settings.enable_whatsapp:
        logger.info("[WhatsApp disabled] To %s: %s", _mask_mobile(mobile), message[:40])
        return {"sent": False, "channel": "whatsapp", "reason": "disabled"}

    # Placeholder for WhatsApp Business API integration.
    logger.warning("[WhatsApp stub] Would send to %s", _mask_mobile(mobile))
    return {"sent": False, "channel": "whatsapp", "reason": "not_configured"}


def send_push(
    mobile: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    settings = get_settings()
    if not settings.enable_push_notifications:
        logger.info("[Push disabled] To %s: %s", _mask_mobile(mobile), title)
        return {"sent": False, "channel": "push", "reason": "disabled"}

    logger.warning("[Push stub] Would notify %s", _mask_mobile(mobile))
    return {"sent": False, "channel": "push", "reason": "not_configured"}


def deliver_otp(mobile: str, otp: str, channel: str = "sms") -> Dict[str, Any]:
    message = f"Your AllSplit verification code is {otp}. Valid for a few minutes."
    if channel == "whatsapp":
        return send_whatsapp(mobile, message)
    return send_sms(mobile, message)


def notify_split_participants(
    split_doc: Dict[str, Any],
    creator_mobile: Optional[str] = None,
) -> Dict[str, Any]:
    settings = get_settings()
    if not (
        settings.enable_sms
        or settings.enable_whatsapp
        or settings.enable_push_notifications
    ):
        logger.info(
            "[Notifications disabled] Split '%s' participant alerts skipped",
            split_doc.get("split_name", "unknown"),
        )
        return {"sent": [], "skipped": True, "reason": "all_channels_disabled"}

    split_name = split_doc.get("split_name", "a bill")
    total = split_doc.get("bill_summary", {}).get("total_amount")
    amount_text = f"₹{total}" if total is not None else "your share"

    results: List[Dict[str, Any]] = []
    for person in split_doc.get("people", []):
        phone = person.get("phone")
        if not phone:
            continue
        if creator_mobile and phone == creator_mobile:
            continue

        name = person.get("name", "there")
        invite_text = (
            f"Hi {name}, you were added to split '{split_name}' on AllSplit. "
            f"Open the app to view {amount_text}."
        )
        push_title = "New split on AllSplit"
        push_body = f"{split_name} — tap to view your share."

        results.append(send_whatsapp(phone, invite_text))
        results.append(send_sms(phone, invite_text))
        results.append(
            send_push(
                phone,
                push_title,
                push_body,
                data={"split_name": split_name, "phone": phone},
            )
        )

    return {"sent": results, "skipped": False}
