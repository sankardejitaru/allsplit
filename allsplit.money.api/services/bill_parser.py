import re
from typing import List, Dict

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

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    items = []
    inside = True
    current_item = None

    
    for line in lines:
        low = line.lower()

        # Start items
        if any(w in low for w in START_WORDS):
            inside = True
            continue
        
        # End items
        if inside and any(w in low for w in END_WORDS):
            break

        
        if not inside:
            continue
 
        # ---------- ITEM NAME ----------
        if not is_numeric_line(line) and not PRICE_RE.search(line):
            current_item = {
                "item": line,
                "qty": 1,
                "amount": None
            }
            items.append(current_item)
            continue

        # ---------- PRICE / QTY ----------
        if current_item:
            numbers = PRICE_RE.findall(line)

            # Last number usually = amount
            if numbers:
                amount = float(numbers[-1].replace(",", "."))
                current_item["amount"] = amount

            
            # Qty detection
            #qty_match = re.search(r"\b\d+\b", line)
            qty_match = re.findall(r"\b(\d+(?:\.\d{1,3})?)\b(?!\s*%)", line)
             
            if qty_match:
                    for q in qty_match:
                        qf = float(q)

                        # Quantity is usually small (1–50)
                        if 0 < qf <= 10:
                            current_item["qty"] = int(qf)
                            break

    # Cleanup: remove garbage
    cleaned = []
    for i in items:
        if len(i["item"]) > 3 and not i["item"].lower().startswith(("sgst", "cgst", "total")):
            cleaned.append(i)
    # remove items with no amount
    cleaned = [i for i in cleaned if i["amount"] is not None]
    return cleaned