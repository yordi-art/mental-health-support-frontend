# This system uses rule-based AI logic to support decision-making
# and does not replace professional medical diagnosis.

# ─── Severity Classification ──────────────────────────────────────────────────

_THRESHOLDS = [
    (4,  "Minimal",  "Minimal symptoms detected. Maintain healthy routines and monitor your mood."),
    (9,  "Mild",     "Mild symptoms detected. Consider speaking with a counselor."),
    (14, "Moderate", "Moderate symptoms detected. Consider consulting a therapist."),
]
_SEVERE = ("Severe", "Severe symptoms detected. Please seek immediate support from a clinical psychologist.")

def assess(assessment_type: str, answers: list) -> dict:
    """
    Rule-based mental health assessment for PHQ-9 and GAD-7.
    answers: list of ints in range 0–3.
    """
    expected = 9 if assessment_type == "PHQ-9" else 7
    if len(answers) != expected:
        raise ValueError(f"Expected {expected} answers for {assessment_type}, got {len(answers)}")
    if any(not (0 <= a <= 3) for a in answers):
        raise ValueError("Each answer must be between 0 and 3.")

    score = sum(answers)
    for threshold, severity, message in _THRESHOLDS:
        if score <= threshold:
            return {"score": score, "severity": severity, "message": message}
    severity, message = _SEVERE
    return {"score": score, "severity": severity, "message": message}


# ─── Therapist Matching ───────────────────────────────────────────────────────

# Severity → preferred specialization keywords (ordered by relevance)
_SEVERITY_SPECS = {
    "Minimal":  ["counselor", "counseling", "wellness"],
    "Mild":     ["counselor", "counseling", "therapist", "therapy"],
    "Moderate": ["therapist", "therapy", "psychotherapy", "cbt"],
    "Severe":   ["clinical psychologist", "clinical psychology", "psychiatry", "psychotherapy"],
}

def _relevance(specialization: str, severity: str) -> int:
    """Returns relevance rank (lower index = higher relevance, -1 = no match)."""
    spec_lower = specialization.lower()
    for rank, keyword in enumerate(_SEVERITY_SPECS.get(severity, [])):
        if keyword in spec_lower:
            return rank
    return len(_SEVERITY_SPECS.get(severity, [])) + 1  # lowest priority


def match_therapists_rule_based(severity: str, therapists: list) -> list:
    """
    Filter verified + available therapists, then sort by severity relevance
    and rating (descending).
    """
    candidates = [
        t for t in therapists
        if t.get("verificationStatus") == "VERIFIED" and t.get("availability") is True
    ]

    candidates.sort(key=lambda t: (
        _relevance(t.get("specialization", ""), severity),
        -t.get("rating", 0)
    ))

    return [
        {"name": t["name"], "specialization": t["specialization"], "rating": t["rating"]}
        for t in candidates
    ]


# ─── Integration ──────────────────────────────────────────────────────────────

def process_user(answers: list, therapists: list, assessment_type: str = "PHQ-9") -> dict:
    """
    Full pipeline: run rule-based assessment, then return matched therapists.
    """
    result = assess(assessment_type, answers)
    result["recommendedTherapists"] = match_therapists_rule_based(result["severity"], therapists)
    return result


# ─── Example Usage ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sample_answers_phq9 = [1, 2, 1, 2, 1, 1, 2, 1, 0]  # score = 11 → Moderate
    sample_answers_gad7 = [1, 1, 2, 1, 0, 1, 1]         # score = 7  → Mild

    print("PHQ-9:", assess("PHQ-9", sample_answers_phq9))
    print("GAD-7:", assess("GAD-7", sample_answers_gad7))

    sample_therapists = [
        {"name": "Dr. Alice",  "specialization": "Clinical Psychologist", "rating": 4.9, "availability": True,  "verificationStatus": "VERIFIED"},
        {"name": "Dr. Bob",    "specialization": "Counselor",             "rating": 4.5, "availability": True,  "verificationStatus": "VERIFIED"},
        {"name": "Dr. Carol",  "specialization": "Therapist",             "rating": 4.7, "availability": False, "verificationStatus": "VERIFIED"},
        {"name": "Dr. Dave",   "specialization": "Therapist",             "rating": 4.8, "availability": True,  "verificationStatus": "PENDING"},
        {"name": "Dr. Eve",    "specialization": "Psychotherapist",       "rating": 4.6, "availability": True,  "verificationStatus": "VERIFIED"},
    ]

    print("\nprocess_user (PHQ-9, Moderate):")
    import json
    print(json.dumps(process_user(sample_answers_phq9, sample_therapists, "PHQ-9"), indent=2))
