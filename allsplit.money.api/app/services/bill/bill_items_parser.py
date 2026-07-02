import re
from typing import Any, Dict, List, Optional, Tuple

NUM_PATTERN = r"\d+(?:\.\d+)?"
THREE_NUMS_RE = re.compile(rf"^({NUM_PATTERN})\s+({NUM_PATTERN})\s+({NUM_PATTERN})$")
ROW_WITH_NAME_RE = re.compile(
    rf"^(.+?)\s+({NUM_PATTERN})\s+({NUM_PATTERN})\s+({NUM_PATTERN})$"
)
SINGLE_NUM_RE = re.compile(rf"^{NUM_PATTERN}$")

STOP_WORDS = (
    "sub total", "subtotal", "grand total", "net amount", "net total",
    "total amount", "amount payable", "round off", "thank you", "thank",
)
STOP_WORD_FRAGMENTS = ("sgst", "cgst", "gst", "round", "cash", "net")

NAME_HEADERS = ("particular", "item", "description", "product", "menu", "sno", "sl")
QTY_HEADERS = ("qty", "quantity", "qnty", "nos")
RATE_HEADERS = ("rate", "price", "unit", "mrp")
AMOUNT_HEADERS = ("amount", "amt", "value")

METADATA_HINTS = (
    "gst no", "fssai", "bill no", "invoice", "table", "dinein", "dine in",
    "waiter", "guest", "phone", "mobile", "date", "time", "token", "order",
)


def _to_float(value: str) -> Optional[float]:
    try:
        return float(value.replace(",", ""))
    except (TypeError, ValueError):
        return None


def _normalize_lines(text: str) -> List[str]:
    return [line.strip() for line in text.splitlines() if line.strip()]


def _is_stop_line(line: str) -> bool:
    lower = line.lower()
    if any(word in lower for word in STOP_WORDS):
        return True
    if lower.startswith("total") or lower.endswith(" total"):
        return True
    return any(
        fragment in lower.split()
        for fragment in STOP_WORD_FRAGMENTS
        if len(lower.split()) <= 3
    )


def _is_metadata_line(line: str) -> bool:
    lower = line.lower()
    return any(hint in lower for hint in METADATA_HINTS)


def _header_keyword_score(text: str) -> int:
    lower = text.lower()
    score = 0
    if any(keyword in lower for keyword in NAME_HEADERS):
        score += 1
    if any(keyword in lower for keyword in QTY_HEADERS):
        score += 1
    if any(keyword in lower for keyword in RATE_HEADERS):
        score += 1
    if any(keyword in lower for keyword in AMOUNT_HEADERS):
        score += 1
    return score


def _find_table_start(lines: List[str]) -> Tuple[int, bool, List[str]]:
    best_index = 0
    best_score = 0
    best_span = 1

    for index in range(len(lines)):
        for span in (1, 2, 3):
            if index + span > len(lines):
                continue
            window = " ".join(lines[index:index + span])
            score = _header_keyword_score(window)
            if score > best_score:
                best_score = score
                best_index = index
                best_span = span

    if best_score >= 2:
        start = best_index + best_span
        while start < len(lines) and _header_keyword_score(lines[start]) > 0:
            start += 1
        columns = _detect_columns(" ".join(lines[best_index:best_index + best_span]))
        return start, True, columns

    for index, line in enumerate(lines):
        if _is_metadata_line(line) or _header_keyword_score(line) > 0:
            continue
        if _looks_like_item_line(line) or _is_single_number_line(line):
            return index, False, ["name", "qty", "rate", "amount"]

    return 0, False, ["name", "qty", "rate", "amount"]


def _detect_columns(header_text: str) -> List[str]:
    lower = header_text.lower()
    columns: List[str] = []
    if any(keyword in lower for keyword in NAME_HEADERS):
        columns.append("name")
    if any(keyword in lower for keyword in QTY_HEADERS):
        columns.append("qty")
    if any(keyword in lower for keyword in RATE_HEADERS):
        columns.append("rate")
    if any(keyword in lower for keyword in AMOUNT_HEADERS):
        columns.append("amount")
    return columns or ["name", "qty", "rate", "amount"]


def _is_single_number_line(line: str) -> bool:
    return SINGLE_NUM_RE.match(line.strip()) is not None


def _extract_three_numbers(line: str) -> Optional[Tuple[float, float, float]]:
    match = THREE_NUMS_RE.match(line.strip())
    if match:
        return (
            float(match.group(1)),
            float(match.group(2)),
            float(match.group(3)),
        )

    row_match = ROW_WITH_NAME_RE.match(line.strip())
    if row_match:
        return (
            float(row_match.group(2)),
            float(row_match.group(3)),
            float(row_match.group(4)),
        )

    numbers = [_to_float(value) for value in re.findall(NUM_PATTERN, line)]
    numbers = [value for value in numbers if value is not None]
    if len(numbers) >= 3:
        qty, rate, amount = numbers[-3], numbers[-2], numbers[-1]
        return qty, rate, amount
    return None


def _looks_like_item_line(line: str) -> bool:
    return ROW_WITH_NAME_RE.match(line.strip()) is not None


def _normalize_qty(qty: float, rate: float, amount: float) -> float:
    if qty > 10 and rate > 100 and abs((qty / 10) * rate - amount) < max(amount * 0.15, 50):
        return qty / 10
    return qty


def _build_item(name: str, qty: float, rate: float, amount: float) -> Dict[str, Any]:
    clean_name = re.sub(r"\s+", " ", name).strip(" -:")
    qty = _normalize_qty(qty, rate, amount)
    if amount <= 0 and qty > 0 and rate > 0:
        amount = round(qty * rate, 2)
    if rate <= 0 and qty > 0 and amount > 0:
        rate = round(amount / qty, 2)

    return {
        "name": clean_name,
        "qty": qty,
        "rate": rate,
        "amount": amount,
    }


def _is_valid_item(item: Dict[str, Any]) -> bool:
    if not item.get("name") or len(item["name"]) < 2:
        return False
    if _is_stop_line(item["name"]):
        return False
    if item.get("amount", 0) <= 0 and item.get("rate", 0) <= 0:
        return False
    if item.get("rate", 0) > 100000 or item.get("amount", 0) > 1000000:
        return False
    return True


def _parse_stacked_block(lines: List[str], index: int, name_parts: List[str]) -> Optional[Tuple[Dict[str, Any], int]]:
    if index + 3 >= len(lines):
        return None

    qty = _to_float(lines[index + 1])
    rate = _to_float(lines[index + 2])
    amount = _to_float(lines[index + 3])
    if qty is None or rate is None or amount is None:
        return None

    if _extract_three_numbers(lines[index]) or _looks_like_item_line(lines[index]):
        return None

    name = " ".join(name_parts + [lines[index]]).strip()
    return _build_item(name, qty, rate, amount), index + 4


def _parse_rows(lines: List[str], start_index: int) -> Tuple[List[Dict[str, Any]], str]:
    items: List[Dict[str, Any]] = []
    name_parts: List[str] = []
    pending_numbers: Optional[Tuple[float, float, float]] = None
    index = start_index
    strategy = "row_regex"

    while index < len(lines):
        line = lines[index]

        if _is_stop_line(line):
            break

        if _is_metadata_line(line) and not name_parts and pending_numbers is None:
            index += 1
            continue

        row_match = ROW_WITH_NAME_RE.match(line)
        if row_match:
            name = " ".join(name_parts + [row_match.group(1)]).strip()
            name_parts = []
            pending_numbers = None
            item = _build_item(
                name,
                float(row_match.group(2)),
                float(row_match.group(3)),
                float(row_match.group(4)),
            )
            if _is_valid_item(item):
                items.append(item)
            index += 1
            index = _consume_suffix_lines(lines, index, items)
            continue

        if _is_single_number_line(line) and index + 2 < len(lines):
            qty = _to_float(line)
            rate = _to_float(lines[index + 1])
            amount = _to_float(lines[index + 2])
            if qty is not None and rate is not None and amount is not None:
                if name_parts:
                    item = _build_item(" ".join(name_parts), qty, rate, amount)
                    name_parts = []
                    pending_numbers = None
                    if _is_valid_item(item):
                        items.append(item)
                        strategy = "stacked_lines"
                    index += 3
                    index = _consume_suffix_lines(lines, index, items)
                    continue

                pending_numbers = (qty, rate, amount)
                index += 3
                continue

        numbers = _extract_three_numbers(line)
        if numbers and not re.search(r"[A-Za-z]", line):
            if name_parts:
                item = _build_item(" ".join(name_parts), *numbers)
                name_parts = []
                pending_numbers = None
                if _is_valid_item(item):
                    items.append(item)
                index += 1
                index = _consume_suffix_lines(lines, index, items)
                continue

            pending_numbers = numbers
            index += 1
            continue

        stacked = _parse_stacked_block(lines, index, name_parts)
        if stacked:
            item, next_index = stacked
            name_parts = []
            pending_numbers = None
            if _is_valid_item(item):
                items.append(item)
                strategy = "stacked_lines"
            index = next_index
            index = _consume_suffix_lines(lines, index, items)
            continue

        if pending_numbers and not _is_single_number_line(line):
            item = _build_item(line, *pending_numbers)
            pending_numbers = None
            if _is_valid_item(item):
                items.append(item)
                strategy = "stacked_lines"
            index += 1
            index = _consume_suffix_lines(lines, index, items)
            continue

        if _header_keyword_score(line) > 0:
            index += 1
            continue

        if not _is_single_number_line(line):
            name_parts.append(line)
        index += 1

    return items, strategy


def _consume_suffix_lines(lines: List[str], index: int, items: List[Dict[str, Any]]) -> int:
    """Attach short single-word OCR fragments to the previous item name."""
    while index < len(lines) and items:
        line = lines[index]
        words = line.split()

        if (
            _is_stop_line(line)
            or _is_metadata_line(line)
            or _header_keyword_score(line) > 0
            or _looks_like_item_line(line)
            or _extract_three_numbers(line)
            or _is_single_number_line(line)
            or len(words) != 1
        ):
            break

        items[-1]["name"] = f"{items[-1]['name']} {line}".strip()
        index += 1

    return index


def extract_items_from_text(text: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    lines = _normalize_lines(text)
    start_index, header_detected, columns = _find_table_start(lines)
    items, strategy = _parse_rows(lines, start_index)

    parse_meta = {
        "strategy": strategy if header_detected else "headerless_" + strategy,
        "header_detected": header_detected,
        "columns": columns,
        "items_found": len(items),
        "line_count": len(lines),
        "table_start_index": start_index,
    }

    if header_detected:
        parse_meta["strategy"] = "header_" + strategy

    return items, parse_meta
