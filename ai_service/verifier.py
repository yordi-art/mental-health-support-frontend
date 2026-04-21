"""
AI Therapist Document Verification
=====================================
Uses keyword-based validation to verify therapist license documents.
Checks for required professional keywords in submitted document text.
This does not replace official credential verification processes.
"""

# Required keywords that a valid therapist license/certificate must contain
REQUIRED_KEYWORDS = [
    "license", "licensed", "certificate", "certification",
    "therapy", "therapist", "counselor", "counseling",
    "psychology", "psychologist", "mental health",
    "ministry of health", "health bureau", "board of health",
]

# Strong approval keywords — if any of these are found, confidence is high
STRONG_KEYWORDS = [
    "licensed therapist", "licensed counselor", "licensed psychologist",
    "certificate of competency", "ministry of health", "board certified",
]

# Rejection triggers — if any of these are found, reject immediately
REJECTION_TRIGGERS = [
    "expired", "revoked", "suspended", "invalid", "cancelled",
]


def verify_document(document_text: str) -> dict:
    """
    Verify a therapist document by scanning for required keywords.

    Steps:
      1. Normalize text to lowercase
      2. Check for rejection triggers first (hard reject)
      3. Count how many required keywords are present
      4. Approve if threshold is met, reject otherwise

    Returns:
      {
        "verification_status": "Approved" | "Rejected",
        "confidence":          0.0 – 1.0,
        "matched_keywords":    [...],
        "reason":              "..."
      }
    """
    if not document_text or not document_text.strip():
        return {
            "verification_status": "Rejected",
            "confidence":          0.0,
            "matched_keywords":    [],
            "reason":              "Empty document submitted.",
        }

    text = document_text.lower()

    # Step 1 — Hard reject on revocation/expiry triggers
    triggered = [kw for kw in REJECTION_TRIGGERS if kw in text]
    if triggered:
        return {
            "verification_status": "Rejected",
            "confidence":          0.0,
            "matched_keywords":    [],
            "reason":              f"Document contains disqualifying terms: {', '.join(triggered)}.",
        }

    # Step 2 — Count matched required keywords
    matched = [kw for kw in REQUIRED_KEYWORDS if kw in text]
    strong  = [kw for kw in STRONG_KEYWORDS   if kw in text]

    # Need at least 2 required keywords to approve
    MIN_REQUIRED = 2
    if len(matched) < MIN_REQUIRED:
        return {
            "verification_status": "Rejected",
            "confidence":          round(len(matched) / len(REQUIRED_KEYWORDS), 2),
            "matched_keywords":    matched,
            "reason":              (
                f"Insufficient credentials found. "
                f"Expected keywords like: license, certificate, therapist, counselor. "
                f"Only found: {matched or 'none'}."
            ),
        }

    # Step 3 — Compute confidence score
    base_confidence  = len(matched) / len(REQUIRED_KEYWORDS)
    strong_bonus     = min(len(strong) * 0.1, 0.3)   # up to +0.3 for strong keywords
    confidence       = round(min(base_confidence + strong_bonus, 1.0), 2)

    return {
        "verification_status": "Approved",
        "confidence":          confidence,
        "matched_keywords":    matched,
        "reason":              (
            f"Document verified successfully. "
            f"Found {len(matched)} credential keyword(s)"
            + (f" including strong indicators: {strong}." if strong else ".")
        ),
    }
