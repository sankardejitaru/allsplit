import re

def clean_mobile_ocr(text: str) -> str:
    """
    Cleans noisy mobile OCR output before parsing
    """

    if isinstance(text, dict):
        text = text.get("text", "")

    # Normalize unicode junk (like ២, special symbols)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)

    # Remove repeated separators / noise
    text = re.sub(r"[-_•♦✔✔]+", " ", text)

    # Fix broken spacing
    text = re.sub(r"\s+", " ", text)

    # Restore line structure heuristically
    text = text.replace(" Item ", "\nItem\n")
    text = text.replace(" Qty ", "\nQty\n")
    text = text.replace(" Total ", "\nTotal\n")

    # Split better for parser
    lines = text.split(".")

    cleaned = "\n".join([l.strip() for l in lines if l.strip()])

    return cleaned