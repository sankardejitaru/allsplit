import re
from typing import List, Dict

STOP_WORDS = (
    "total", "subtotal", "sgst", "cgst",
    "gst", "round", "cash", "net", "items"
)


def is_stop_line(line: str) -> bool:
    return any(word in line.lower() for word in STOP_WORDS)


def extract_items_from_text(text: str) -> List[Dict]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    items = []
    i = 0
    table_started = False

    while i < len(lines):
        line = lines[i].lower()

        # Detect header row
        if (
            "particular" in line
            and i + 3 < len(lines)
            and lines[i + 1].lower().startswith("qty")
            and lines[i + 2].lower().startswith("rate")
            and lines[i + 3].lower().startswith("amount")
        ):
            table_started = True
            i += 4
            continue

        if not table_started:
            i += 1
            continue

        # Stop at totals
        if is_stop_line(lines[i]):
            break

        try:
            name = lines[i]
            qty = float(lines[i + 1])
            rate = float(lines[i + 2])
            amount = float(lines[i + 3])

            items.append({
                "name": name,
                "qty": qty,
                "rate": rate,
                "amount": amount
            })

            i += 4
        except (ValueError, IndexError):
            i += 1

    return items