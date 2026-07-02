import re
from typing import Dict, List

START_WORDS = []
END_WORDS = ["thank"]

PRICE_RE = re.compile(r"\d+(?:[.,]\d{2})")


def is_numeric_line(line: str) -> bool:
    return bool(re.fullmatch(r"[\d.,\s]+", line))


def parse_bill_items(text: str) -> List[Dict]:
    if isinstance(text, dict):
        text = text.get("text", "")

    if not isinstance(text, str):
        raise ValueError("OCR text must be a string")

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    items = []
    inside = True
    current_item = None

    for line in lines:
        low = line.lower()

        if any(word in low for word in START_WORDS):
            inside = True
            continue

        if inside and any(word in low for word in END_WORDS):
            break

        if not inside:
            continue

        if not is_numeric_line(line) and not PRICE_RE.search(line):
            current_item = {
                "item": line,
                "qty": 1,
                "amount": None,
            }
            items.append(current_item)
            continue

        if current_item:
            numbers = PRICE_RE.findall(line)

            if numbers:
                amount = float(numbers[-1].replace(",", "."))
                current_item["amount"] = amount

            qty_match = re.findall(r"\b(\d+(?:\.\d{1,3})?)\b(?!\s*%)", line)

            if qty_match:
                for qty in qty_match:
                    qty_float = float(qty)
                    if 0 < qty_float <= 10:
                        current_item["qty"] = int(qty_float)
                        break

    cleaned = []
    for item in items:
        if len(item["item"]) > 3 and not item["item"].lower().startswith(("sgst", "cgst", "total")):
            cleaned.append(item)

    return [item for item in cleaned if item["amount"] is not None]
