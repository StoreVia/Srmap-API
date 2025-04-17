import pytesseract
from PIL import Image
from io import BytesIO

def solve_captcha(image_bytes):
    try:
        image = Image.open(BytesIO(image_bytes))
        text = pytesseract.image_to_string(image, config='--psm 6').strip().replace(" ", "")
        return text
    except Exception as e:
        print(f"Captcha solving error: {e}")
        return None