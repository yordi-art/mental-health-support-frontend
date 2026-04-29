"""
AI-Based Therapist Recommendation Module

This module uses rule-based AI logic to support therapist recommendation
and does not replace professional medical advice.

Matches assessment severity to therapist specialization using predefined rules.
No machine learning — pure rule-based scoring and ranking.
"""

# ── STEP 2: MATCHING RULES ────────────────────────────────────────────────────

SEVERITY_TO_TYPE = {
    "minimal":  ["counselor", "counseling", "wellness coach"],
    "mild":     ["counselor", "counseling", "therapist", "therapy", "general therapist"],
    "moderate": ["licensed therapist", "therapist", "therapy", "psychotherapy", "cbt"],
    "severe":   ["clinical psychologist", "clinical psychology", "psychiatry", "psychiatric"],
}


def recommend_therapists(assessment: dict, therapists: list) -> list:
    """
    Recommend therapists based on assessment severity using rule-based matching.

    Args:
        assessment: {"score": int, "severity": str, "type": str}
        therapists: [{"name": str, "specialization": list[str], "rating": float,
                      "availability": bool, "verificationStatus": str, ...}]

    Returns:
        Sorted list of recommended therapists with match_score and reason.
    """
    severity = assessment.get("severity", "mild").lower()

    # ── STEP 1: FILTER THERAPISTS ──────────────────────────────────────────────
    filtered = [
        t for t in therapists
        if t.get("verificationStatus") == "VERIFIED"
        and t.get("availability") is True
    ]

    if not filtered:
        # ── STEP 7: EDGE CASE ──────────────────────────────────────────────────
        return []

    # ── STEP 3: RELEVANCE SCORING ──────────────────────────────────────────────
    preferred_keywords = SEVERITY_TO_TYPE.get(severity, SEVERITY_TO_TYPE["mild"])

    def calculate_match_score(therapist):
        specs = " ".join(therapist.get("specialization", [])).lower()
        rating = float(therapist.get("rating", 0))

        # Specialization score
        spec_score = 0
        for keyword in preferred_keywords:
            if keyword in specs:
                spec_score = 2  # full match
                break
        else:
            # Partial match: any mental health keyword
            if any(kw in specs for kw in ["therapy", "counseling", "psychology", "mental health"]):
                spec_score = 1

        # ── STEP 3: match_score = specialization_score + rating ────────────────
        match_score = spec_score + rating
        return match_score, spec_score

    # Score all therapists
    scored = []
    for t in filtered:
        match_score, spec_score = calculate_match_score(t)
        reason = _build_reason(severity, spec_score, t.get("rating", 0))
        scored.append({
            "name":           t.get("name"),
            "specialization": t.get("specialization"),
            "rating":         t.get("rating", 0),
            "match_score":    round(match_score, 2),
            "reason":         reason,
            # Include full therapist data for frontend
            **{k: v for k, v in t.items() if k not in ("name", "specialization", "rating")},
        })

    # ── STEP 4: SORTING ────────────────────────────────────────────────────────
    scored.sort(key=lambda x: (x["match_score"], x["rating"]), reverse=True)

    return scored


def _build_reason(severity: str, spec_score: int, rating: float) -> str:
    """Generate human-readable match reason."""
    if spec_score == 2:
        return f"Matches {severity} severity level and has high rating ({rating}★)"
    elif spec_score == 1:
        return f"Partial match for {severity} severity with rating {rating}★"
    else:
        return f"Available therapist with rating {rating}★"
