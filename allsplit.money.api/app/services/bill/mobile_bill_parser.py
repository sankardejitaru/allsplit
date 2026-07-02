import re


def clean_mobile_ocr(text: str) -> str:
    replacements = {
        "CIKE": "COKE",
        "BASY": "BABY",
        "Farticulars": "Particulars",
        "Retk": "Rate",
        "GEE": "GHEE",
        "POTAL": "PONGAL",
        "ROLES": "NOODLES",
        "SEST": "SGST",
        "Sal⭑ct": "Sub Total",
        "₹": "Rs ",
        "|": "",
    }

    for wrong, correct in replacements.items():
        text = text.replace(wrong, correct)

    text = re.sub(r"(?<=\d)\s+(?=\d)", ".", text)
    text = re.sub(r"\s{2,}", " ", text)

    lines = []
    for line in text.splitlines():
        line = line.strip()
        if len(line) > 2:
            lines.append(line)

    return "\n".join(lines)


def parse_mobile_bill(text: str):
    items = []
    lines = text.splitlines()

    for line in lines:
        match = re.search(r"(.+?)\s+(\d+)\s+(\d+\.\d{2})", line)
        if match:
            name, qty, price = match.groups()
            items.append({
                "item": name.strip(),
                "qty": int(qty),
                "price": float(price),
            })

    return items
