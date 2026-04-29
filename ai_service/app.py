"""
Flask API — Mental Health AI Microservice
==========================================
This system uses machine learning to support decision-making
and does not replace professional medical diagnosis.

The Python service connects DIRECTLY to MongoDB.
Node.js only sends assessment answers — all therapist data
is fetched from the database here, no mock data anywhere.

Endpoints:
  POST /ai/assess           — XGBoost assessment only (PHQ-9 or GAD-7)
  POST /ai/assess-and-match — full pipeline: assess + DB fetch + KNN match
  POST /ai/match            — KNN match using live DB therapist data
  POST /ai/comorbidity      — cross-assessment comorbidity detection
  GET  /ai/health           — health check

  — Simple API (standalone, no DB required) —
  POST /assessment          — combined PHQ-9 + GAD-7 score → classification
  POST /match               — classification + therapist list → ranked recommendations
  POST /verify              — document text → Approved / Rejected
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'license_verifier'))

from flask import Flask, request, jsonify
from ai_engine import run_assessment, detect_comorbidity, match_therapists
from db import fetch_verified_therapists
from verifier import verify_document
from ocr_service import extract_text
from validation_service import validate
from ml_service import predict

app = Flask(__name__)

AI_DISCLAIMER = (
    "This system uses machine learning to support decision-making "
    "and does not replace professional medical diagnosis."
)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _extract_scores(answers: list) -> list:
    """Accept [{score: N}, ...] or [N, ...]"""
    return [
        int(a["score"]) if isinstance(a, dict) else int(a)
        for a in answers
    ]

def _validate(assessment_type: str, scores: list):
    expected = 9 if assessment_type == "PHQ-9" else 7
    if len(scores) != expected:
        raise ValueError(f"Expected {expected} answers for {assessment_type}, got {len(scores)}")
    for i, s in enumerate(scores):
        if not (0 <= s <= 3):
            raise ValueError(f"Score at question {i+1} must be 0–3, got {s}")

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/favicon.ico")
def favicon():
    return '', 204


@app.get("/ai/health")
def health():
    return jsonify({"status": "ok", "service": "Mental Health AI", "disclaimer": AI_DISCLAIMER})


@app.post("/ai/assess")
def assess():
    """
    Run ML assessment only. Does not fetch therapists.

    Body: { "type": "PHQ-9"|"GAD-7", "answers": [{score:0-3},...] }
    """
    body = request.get_json(force=True)
    atype = body.get("type", "").upper().replace("PHQ9", "PHQ-9").replace("GAD7", "GAD-7")

    if atype not in ("PHQ-9", "GAD-7"):
        return jsonify({"error": "type must be PHQ-9 or GAD-7"}), 400

    try:
        scores = _extract_scores(body.get("answers", []))
        _validate(atype, scores)
    except (ValueError, KeyError) as e:
        return jsonify({"error": str(e)}), 400

    result = run_assessment(atype, scores)
    return jsonify({"disclaimer": AI_DISCLAIMER, **result})


@app.post("/ai/assess-and-match")
def assess_and_match():
    """
    Full AI pipeline — Node.js sends ONLY answers.
    Python fetches all therapist data directly from MongoDB.

    Body:
      {
        "type": "PHQ-9"|"GAD-7",
        "answers": [{score:0-3},...],
        "previousAssessment": {"type":"GAD-7","severity":"mild"}  // optional
      }
    """
    body = request.get_json(force=True)
    atype = body.get("type", "").upper().replace("PHQ9", "PHQ-9").replace("GAD7", "GAD-7")

    if atype not in ("PHQ-9", "GAD-7"):
        return jsonify({"error": "type must be PHQ-9 or GAD-7"}), 400

    try:
        scores = _extract_scores(body.get("answers", []))
        _validate(atype, scores)
    except (ValueError, KeyError) as e:
        return jsonify({"error": str(e)}), 400

    # Step 1 — ML assessment
    assessment_result = run_assessment(atype, scores)

    # Step 2 — Comorbidity detection against previous opposite-type assessment
    comorbidity_result = None
    prev = body.get("previousAssessment")
    if prev and prev.get("severity"):
        phq9_sev = assessment_result["severity"] if atype == "PHQ-9" else prev["severity"]
        gad7_sev = assessment_result["severity"] if atype == "GAD-7" else prev["severity"]
        comorbidity_result = detect_comorbidity(phq9_sev, gad7_sev)

    # Step 3 — Fetch VERIFIED therapists directly from MongoDB (no mock data)
    therapists = fetch_verified_therapists()

    # Step 4 — KNN matching using live DB data
    ranked = match_therapists(
        severity    = assessment_result["severity"],
        therapists  = therapists,
        risk_flags  = assessment_result["riskFlags"],
        confidence  = assessment_result["confidence"],
        comorbidity = comorbidity_result,
    )

    return jsonify({
        "disclaimer":            AI_DISCLAIMER,
        "assessment":            assessment_result,
        "comorbidity":           comorbidity_result,
        "recommendedTherapists": ranked,
    })


@app.post("/ai/match")
def match():
    """
    Re-run KNN matching only (e.g. for /recommendations endpoint).
    Fetches therapists directly from MongoDB.

    Body:
      {
        "severity":   "moderate",
        "riskFlags":  [],          // optional
        "confidence": 1.0,         // optional
        "comorbidity": null        // optional
      }
    """
    body = request.get_json(force=True)
    severity    = body.get("severity", "minimal")
    risk_flags  = body.get("riskFlags", [])
    confidence  = float(body.get("confidence", 1.0))
    comorbidity = body.get("comorbidity", None)

    # Fetch live from MongoDB
    therapists = fetch_verified_therapists()

    if not therapists:
        return jsonify({"disclaimer": AI_DISCLAIMER, "recommendedTherapists": []})

    ranked = match_therapists(severity, therapists, risk_flags, confidence, comorbidity)
    return jsonify({"disclaimer": AI_DISCLAIMER, "recommendedTherapists": ranked})


@app.post("/ai/comorbidity")
def comorbidity():
    """
    Body: { "phq9Severity": "mild", "gad7Severity": "moderate" }
    """
    body = request.get_json(force=True)
    phq9 = body.get("phq9Severity", "")
    gad7 = body.get("gad7Severity", "")

    if not phq9 or not gad7:
        return jsonify({"error": "phq9Severity and gad7Severity are required"}), 400

    return jsonify(detect_comorbidity(phq9, gad7))



# ─── License Verification Endpoint ──────────────────────────────────────────
# This system uses AI-assisted validation. Final verification should not replace
# official regulatory approval.

@app.post("/verify-license")
def verify_license_endpoint():
    """
    POST /verify-license  (multipart/form-data)
      file           : PDF or image (required)
      therapist_name : string (required)
    """
    if 'file' not in request.files or not request.files['file'].filename:
        return jsonify({"status": "rejected", "issues": ["no document uploaded"]}), 400

    therapist_name = (request.form.get('therapist_name') or '').strip()
    if not therapist_name:
        return jsonify({"error": "therapist_name is required"}), 400

    uploaded = request.files['file']
    try:
        file_bytes = uploaded.read()
        text = extract_text(file_bytes, uploaded.filename)
    except ValueError as e:
        return jsonify({"error": str(e)}), 415
    except Exception as e:
        return jsonify({"error": f"OCR failed: {e}"}), 500

    result = validate(text, therapist_name, document_uploaded=True)

    if result.status == "rejected":
        return jsonify({
            "status": "rejected",
            "confidence": result.score,
            "ml_prediction": None,
            "features": result.features,
            "issues": result.issues,
        })

    ml_label, ml_conf = predict(result.features)
    blended = round(result.score * 0.7 + ml_conf * 0.3, 4)
    final_status = "approved" if blended >= 0.8 else "review_required"

    return jsonify({
        "status": final_status,
        "confidence": blended,
        "ml_prediction": ml_label,
        "features": result.features,
        "issues": result.issues,
    })


# ─── Simple API Endpoints ─────────────────────────────────────────────────────
# Standalone endpoints — no MongoDB required.
# These implement the three core AI components described in the project spec.

# Combined score classification thresholds (PHQ-9 max=27, GAD-7 max=21)
_COMBINED_THRESHOLDS = [
    (8,  "Minimal",  "Minimal symptoms. Maintain healthy routines and monitor your mood."),
    (13, "Mild",     "Mild symptoms. Consider speaking with a counselor."),
    (18, "Moderate", "Moderate symptoms. Consultation with a licensed therapist is recommended."),
]
_COMBINED_SEVERE = ("Severe", "Severe symptoms. Immediate support from a clinical psychologist is strongly advised.")

def _classify_combined(combined_score: int) -> tuple:
    """Rule-based classification on combined PHQ-9 + GAD-7 score."""
    for threshold, label, msg in _COMBINED_THRESHOLDS:
        if combined_score <= threshold:
            return label, msg
    return _COMBINED_SEVERE


@app.post("/assessment")
def simple_assessment():
    """
    AI Mental Health Assessment — combined PHQ-9 + GAD-7 scoring.

    Uses scikit-learn XGBoost models for individual assessments,
    then combines scores for an overall classification.

    Body:  { "phq9": 10, "gad7": 8 }
    Returns: { "phq9_score", "gad7_score", "combined_score", "classification", "recommendation",
               "phq9_severity", "gad7_severity", "confidence" }
    """
    body = request.get_json(force=True)

    phq9 = body.get("phq9")
    gad7 = body.get("gad7")

    # Validate
    if phq9 is None or gad7 is None:
        return jsonify({"error": "Both 'phq9' and 'gad7' scores are required."}), 400
    try:
        phq9, gad7 = int(phq9), int(gad7)
    except (TypeError, ValueError):
        return jsonify({"error": "'phq9' and 'gad7' must be integers."}), 400
    if not (0 <= phq9 <= 27):
        return jsonify({"error": "'phq9' must be between 0 and 27."}), 400
    if not (0 <= gad7 <= 21):
        return jsonify({"error": "'gad7' must be between 0 and 21."}), 400

    combined = phq9 + gad7
    classification, recommendation = _classify_combined(combined)

    # Also run individual XGBoost assessments for richer output
    # Convert raw scores to synthetic per-question answers for the ML model
    # (distribute score evenly across questions as best estimate)
    def _score_to_answers(total, n_questions):
        """Distribute a total score evenly across n questions (0-3 each)."""
        base  = min(total // n_questions, 3)
        extra = total - base * n_questions
        answers = [min(base + (1 if i < extra else 0), 3) for i in range(n_questions)]
        return answers

    phq9_answers = _score_to_answers(phq9, 9)
    gad7_answers = _score_to_answers(gad7, 7)

    try:
        phq9_result = run_assessment("PHQ-9", phq9_answers)
        gad7_result = run_assessment("GAD-7", gad7_answers)
        avg_confidence = round((phq9_result["confidence"] + gad7_result["confidence"]) / 2, 3)
        phq9_severity  = phq9_result["severity"]
        gad7_severity  = gad7_result["severity"]
    except Exception:
        # Fallback: rule-based severity from raw scores
        def _raw_severity(s, mx):
            pct = s / mx
            if pct < 0.19: return "minimal"
            if pct < 0.43: return "mild"
            if pct < 0.67: return "moderate"
            return "severe"
        avg_confidence = None
        phq9_severity  = _raw_severity(phq9, 27)
        gad7_severity  = _raw_severity(gad7, 21)

    return jsonify({
        "disclaimer":      AI_DISCLAIMER,
        "phq9_score":      phq9,
        "gad7_score":      gad7,
        "combined_score":  combined,
        "classification":  classification,
        "recommendation":  recommendation,
        "phq9_severity":   phq9_severity,
        "gad7_severity":   gad7_severity,
        "confidence":      avg_confidence,
    })


@app.post("/match")
def simple_match():
    """
    AI Client–Therapist Matching.

    Filters by availability, matches specialization to severity,
    ranks by best fit. Falls back to rule-based if no ML score available.

    Body:
      {
        "classification": "Moderate",
        "therapists": [
          {"name": "A", "specialization": "therapist", "available": true, "rating": 4.5},
          ...
        ]
      }
    Returns: { "classification", "recommended": [{name, specialization, available, rating, match_score}] }
    """
    body           = request.get_json(force=True)
    classification = body.get("classification", "").strip().capitalize()
    therapists     = body.get("therapists", [])

    if not classification:
        return jsonify({"error": "'classification' is required."}), 400
    if not isinstance(therapists, list):
        return jsonify({"error": "'therapists' must be a list."}), 400

    # Severity → preferred specialization keywords
    SPEC_PRIORITY = {
        "Minimal":  ["counselor", "counseling", "wellness"],
        "Mild":     ["counselor", "counseling", "therapist", "therapy"],
        "Moderate": ["therapist", "therapy", "psychotherapy", "cbt", "clinical"],
        "Severe":   ["clinical psychologist", "psychiatry", "psychotherapy", "clinical"],
    }
    priority_list = SPEC_PRIORITY.get(classification, SPEC_PRIORITY["Mild"])

    def _relevance(spec: str) -> int:
        spec_lower = spec.lower()
        for rank, kw in enumerate(priority_list):
            if kw in spec_lower:
                return rank
        return len(priority_list) + 1

    # Filter: only available therapists
    available = [t for t in therapists if t.get("available") is True]

    if not available:
        return jsonify({
            "classification":  classification,
            "recommended":     [],
            "note":            "No available therapists found.",
        })

    # Sort: relevance first, then rating descending
    ranked = sorted(
        available,
        key=lambda t: (_relevance(t.get("specialization", "")), -float(t.get("rating", 0)))
    )

    # Add match_score for transparency
    max_rank = len(priority_list) + 1
    result = []
    for t in ranked:
        rank  = _relevance(t.get("specialization", ""))
        score = round(1.0 - (rank / (max_rank + 1)), 2)
        result.append({**t, "match_score": score})

    return jsonify({
        "disclaimer":     AI_DISCLAIMER,
        "classification": classification,
        "recommended":    result,
    })


@app.post("/verify")
def verify():
    """
    AI Therapist Document Verification.

    Checks document text for required professional keywords.
    Rejects documents with revocation/expiry triggers.

    Body:    { "document_text": "Licensed therapist certificate..." }
    Returns: { "verification_status": "Approved"|"Rejected", "confidence", "matched_keywords", "reason" }
    """
    body          = request.get_json(force=True)
    document_text = body.get("document_text", "")

    if not isinstance(document_text, str):
        return jsonify({"error": "'document_text' must be a string."}), 400

    result = verify_document(document_text)
    return jsonify({"disclaimer": AI_DISCLAIMER, **result})


# ─── Assessment Process Endpoint ────────────────────────────────────────────
# Verification bypass is enabled only for development/testing and must be disabled in production.

# Severity → required therapist role keywords (matching rules per spec)
_ROLE_MAP = {
    "minimal":  ["counselor", "counseling"],
    "mild":     ["counselor", "counseling", "therapist", "therapy"],
    "moderate": ["therapist", "therapy", "psychotherapy", "cbt", "clinical"],
    "severe":   ["clinical psychologist", "psychiatry", "clinical"],
}


def _severity_from_score(score: int) -> str:
    """Rule-based severity classification (PHQ-9 / GAD-7 shared thresholds)."""
    if score <= 4:  return "minimal"
    if score <= 9:  return "mild"
    if score <= 14: return "moderate"
    return "severe"


def match_therapists_by_role(severity: str, therapists: list) -> list:
    """
    Python matching function.
    Filters: verificationStatus == VERIFIED and availability == True.
    Applies severity-to-role matching rules.
    Sorts by rating descending.

    Matching rules:
      Minimal  → counselor
      Mild     → counselor or therapist
      Moderate → therapist
      Severe   → clinical psychologist
    """
    keywords = _ROLE_MAP.get(severity.lower(), _ROLE_MAP["mild"])

    def _matches(t):
        specs = " ".join(t.get("specialization", [])).lower()
        return any(kw in specs for kw in keywords)

    # Filter: verified + available + role match
    filtered = [
        t for t in therapists
        if t.get("verificationStatus", t.get("verification", {}).get("status", "")) == "VERIFIED"
        and (t.get("availability") or t.get("availabilityCount", 0) > 0)
        and _matches(t)
    ]

    # Sort by rating descending
    filtered.sort(key=lambda t: t.get("rating", 0), reverse=True)
    return filtered


@app.post("/api/assessment/process")
def process_assessment():
    """
    POST /api/assessment/process

    Client submits assessment → backend calculates severity →
    calls Python matching function → returns recommended therapists.

    Body:
      {
        "type":    "PHQ-9" | "GAD-7",
        "answers": [{"score": 0-3}, ...]
      }

    Response:
      { "assessment": {...}, "recommendations": [...] }
    """
    body  = request.get_json(force=True)
    atype = body.get("type", "").upper().replace("PHQ9", "PHQ-9").replace("GAD7", "GAD-7")

    if atype not in ("PHQ-9", "GAD-7"):
        return jsonify({"error": "type must be PHQ-9 or GAD-7"}), 400

    try:
        scores = _extract_scores(body.get("answers", []))
        _validate(atype, scores)
    except (ValueError, KeyError) as e:
        return jsonify({"error": str(e)}), 400

    # Step 1 — Calculate severity
    assessment_result = run_assessment(atype, scores)
    severity = assessment_result["severity"]

    # Step 2 — Fetch verified + available therapists from MongoDB
    therapists = fetch_verified_therapists()

    # Step 3 — Call Python matching function
    recommendations = match_therapists_by_role(severity, therapists)

    return jsonify({
        "disclaimer":     AI_DISCLAIMER,
        "assessment":     assessment_result,
        "recommendations": recommendations,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
