"""
Flask API — Mental Health AI Microservice
==========================================
This system uses machine learning to support decision-making
and does not replace professional medical diagnosis.

The Python service connects DIRECTLY to MongoDB.
Node.js only sends assessment answers — all therapist data
is fetched from the database here, no mock data anywhere.

Endpoints:
  POST /ai/assess          — ML assessment only (PHQ-9 or GAD-7)
  POST /ai/assess-and-match — full pipeline: assess + DB fetch + KNN match
  POST /ai/match           — KNN match using live DB therapist data
  POST /ai/comorbidity     — cross-assessment comorbidity detection
  GET  /ai/health          — health check
"""

from flask import Flask, request, jsonify
from ai_engine import run_assessment, detect_comorbidity, match_therapists
from db import fetch_verified_therapists
from rule_based_ai import process_user as rule_process_user

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


@app.post("/ai/rule-assess")
def rule_assess():
    """
    Rule-based assessment + therapist matching (no ML).
    Fetches therapists directly from MongoDB.

    Body: { "type": "PHQ-9"|"GAD-7", "answers": [0-3, ...] }
    """
    body  = request.get_json(force=True)
    atype = body.get("type", "").upper().replace("PHQ9", "PHQ-9").replace("GAD7", "GAD-7")

    if atype not in ("PHQ-9", "GAD-7"):
        return jsonify({"error": "type must be PHQ-9 or GAD-7"}), 400

    try:
        scores = _extract_scores(body.get("answers", []))
    except (ValueError, KeyError) as e:
        return jsonify({"error": str(e)}), 400

    # Fetch live therapists from MongoDB and adapt to rule-based schema
    raw_therapists = fetch_verified_therapists()
    therapists = [
        {
            "name":               t["name"],
            "specialization":     t["specialization"][0] if t["specialization"] else "",
            "rating":             t["rating"],
            "availability":       len(t["availability"]) > 0,
            "verificationStatus": "VERIFIED",   # already filtered by fetch_verified_therapists
        }
        for t in raw_therapists
    ]

    try:
        result = rule_process_user(scores, therapists, atype)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"disclaimer": AI_DISCLAIMER, **result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
