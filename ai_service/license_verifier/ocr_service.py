"""
OCR Service — extracts raw text from uploaded license documents.
Supports PDF (via PyMuPDF) and images (via pytesseract).

This system uses AI-assisted validation. Final verification should not replace
official regulatory approval.
"""

import io
import fitz  # PyMuPDF
import pytesseract
from PIL import Image


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Return extracted text from a PDF or image file."""
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "pdf":
        return _extract_from_pdf(file_bytes)
    elif ext in ("png", "jpg", "jpeg", "tiff", "bmp", "webp"):
        return _extract_from_image(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")


def _extract_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text = page.get_text()
            if text.strip():
                text_parts.append(text)
            else:
                # Fallback: render page as image and OCR it
                pix = page.get_pixmap(dpi=200)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text_parts.append(pytesseract.image_to_string(img))
    return "\n".join(text_parts)


def _extract_from_image(file_bytes: bytes) -> str:
    img = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(img)
