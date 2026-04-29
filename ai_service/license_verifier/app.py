"""
FastAPI — AI-Assisted Therapist License Verification Microservice

POST /verify-license
  - file          : PDF or image (required)
  - therapist_name: string (required)

This system uses AI-assisted validation. Final verification should not replace
official regulatory approval.
"""

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from ocr_service import extract_text
from validation_service import validate
from ml_service import predict

app = FastAPI(title="License Verifier", version="1.0.0")


@app.post("/verify-license")
async def verify_license(
    file: UploadFile = File(...),
    therapist_name: str = Form(...),
):
    # ── 1. Require document ────────────────────────────────────────────────
    if not file or not file.filename:
        return JSONResponse(
            status_code=400,
            content={"status": "rejected", "issues": ["no document uploaded"]},
        )

    # ── 2. OCR extraction ──────────────────────────────────────────────────
    try:
        file_bytes = await file.read()
        text = extract_text(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=415, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {e}")

    # ── 3. Rule-based validation (PRIMARY) ─────────────────────────────────
    result = validate(text, therapist_name, document_uploaded=True)

    # ── 4. Hard reject — ML cannot override ───────────────────────────────
    if result.status == "rejected":
        return {
            "status": "rejected",
            "confidence": result.score,
            "ml_prediction": None,
            "features": result.features,
            "issues": result.issues,
        }

    # ── 5. ML prediction (SECONDARY) ──────────────────────────────────────
    ml_label, ml_confidence = predict(result.features)

    # ── 6. Hybrid final decision ───────────────────────────────────────────
    # Blend rule score (70 %) + ML confidence (30 %) for non-rejected cases
    blended = round(result.score * 0.7 + ml_confidence * 0.3, 4)

    # Re-classify on blended score but never upgrade a rule rejection
    if blended >= 0.8:
        final_status = "approved"
    elif blended >= 0.5:
        final_status = "review_required"
    else:
        final_status = "review_required"   # floor: already passed rule threshold

    return {
        "status": final_status,
        "confidence": blended,
        "ml_prediction": ml_label,
        "features": result.features,
        "issues": result.issues,
    }
