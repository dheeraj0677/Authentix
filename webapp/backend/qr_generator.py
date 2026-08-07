import os
import qrcode
from io import BytesIO
import base64

def generate_qr_code_base64(data_url: str) -> str:
    """
    Generates a high-contrast PNG QR code for a given verification URL
    and returns a base64-encoded Data URL string (data:image/png;base64,...).
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(data_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#06b6d4", back_color="#0b0f17")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

def save_qr_code_image(data_url: str, output_path: str) -> str:
    """Generates and saves a QR code PNG image file to disk."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(data_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#06b6d4", back_color="#0b0f17")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    return output_path
