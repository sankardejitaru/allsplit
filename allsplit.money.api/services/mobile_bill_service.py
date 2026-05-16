from services.bill_parser import parse_bill_items
from services.mobile_bill_parser import clean_mobile_ocr

def parse_mobile_bill(raw_text: str):

    # Step 1: clean OCR noise
    #cleaned_text = clean_mobile_ocr(raw_text)

    # Step 2: send to your existing parser
    items = parse_bill_items(raw_text)

    return items
    