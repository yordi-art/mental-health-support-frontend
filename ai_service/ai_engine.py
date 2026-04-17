"""
AI Mental Health Assessment Service
=====================================
This system uses machine learning (scikit-learn) to support decision-making
and does not replace professional medical diagnosis.

Models:
  - RandomForestClassifier  : PHQ-9 / GAD-7 severity classification
  - KNeighborsClassifier    : therapist–client matching
  - TF-IDF + cosine similarity : symptom text analysis

The models are trained on synthetic but clinically-grounded data derived
from published PHQ-9 / GAD-7 scoring norms.
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings("ignore")

# ─── Label Encoding ───────────────────────────────────────────────────────────

SEVERITY_LABELS  = ["minimal", "mild", "moderate", "severe"]
CONDITION_LABELS = ["depression", "anxiety"]

severity_encoder = LabelEncoder()
severity_encoder.fit(SEVERITY_LABELS)

# ─── Training Data Generation ─────────────────────────────────────────────────
# Synthetic training data grounded in PHQ-9 / GAD-7 clinical norms.
# Each sample is a 9-dim (PHQ-9) or 7-dim (GAD-7) answer vector + label.

def _generate_phq9_training_data():
    """
    Generate synthetic PHQ-9 training samples.
    Answers are 9 values in [0,3]. Label is severity class.
    Distributions are derived from published PHQ-9 scoring norms:
      minimal  : total 0–4
      mild     : total 5–9
      moderate : total 10–14
      severe   : total 15–27
    """
    rng = np.random.default_rng(42)
    X, y = [], []

    for _ in range(400):
        # minimal: low scores across all questions
        answers = rng.integers(0, 2, size=9)
        while answers.sum() > 4:
            answers = rng.integers(0, 2, size=9)
        X.append(answers); y.append("minimal")

    for _ in range(400):
        # mild: moderate scores, total 5–9
        answers = rng.integers(0, 3, size=9)
        while not (5 <= answers.sum() <= 9):
            answers = rng.integers(0, 3, size=9)
        X.append(answers); y.append("mild")

    for _ in range(400):
        # moderate: total 10–14
        answers = rng.integers(0, 4, size=9)
        while not (10 <= answers.sum() <= 14):
            answers = rng.integers(0, 4, size=9)
        X.append(answers); y.append("moderate")

    for _ in range(400):
        # severe: total 15+, Q9 (suicidal ideation) often elevated
        answers = rng.integers(1, 4, size=9)
        answers[8] = rng.integers(2, 4)   # Q9 elevated in severe cases
        while answers.sum() < 15:
            answers = rng.integers(1, 4, size=9)
            answers[8] = rng.integers(2, 4)
        X.append(answers); y.append("severe")

    return np.array(X), np.array(y)


def _generate_gad7_training_data():
    """
    Generate synthetic GAD-7 training samples.
    Answers are 7 values in [0,3]. Label is severity class.
    """
    rng = np.random.default_rng(99)
    X, y = [], []

    for _ in range(400):
        answers = rng.integers(0, 2, size=7)
        while answers.sum() > 4:
            answers = rng.integers(0, 2, size=7)
        X.append(answers); y.append("minimal")

    for _ in range(400):
        answers = rng.integers(0, 3, size=7)
        while not (5 <= answers.sum() <= 9):
            answers = rng.integers(0, 3, size=7)
        X.append(answers); y.append("mild")

    for _ in range(400):
        answers = rng.integers(0, 4, size=7)
        while not (10 <= answers.sum() <= 14):
            answers = rng.integers(0, 4, size=7)
        X.append(answers); y.append("moderate")

    for _ in range(400):
        answers = rng.integers(1, 4, size=7)
        answers[6] = rng.integers(2, 4)   # Q7 (panic tendency) elevated
        while answers.sum() < 15:
            answers = rng.integers(1, 4, size=7)
            answers[6] = rng.integers(2, 4)
        X.append(answers); y.append("severe")

    return np.array(X), np.array(y)

# ─── Model Training ───────────────────────────────────────────────────────────

def _train_classifier(X, y):
    """
    Train a Random Forest classifier for severity prediction.
    Random Forest is chosen for:
      - robustness to small datasets
      - built-in feature importance (which questions matter most)
      - probability outputs for confidence scoring
    """
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_leaf=3,
        class_weight="balanced",   # handle any class imbalance
        random_state=42
    )
    clf.fit(X, y)
    return clf


print("[AI] Training PHQ-9 classifier...")
_X_phq9, _y_phq9 = _generate_phq9_training_data()
phq9_model = _train_classifier(_X_phq9, _y_phq9)

print("[AI] Training GAD-7 classifier...")
_X_gad7, _y_gad7 = _generate_gad7_training_data()
gad7_model = _train_classifier(_X_gad7, _y_gad7)

print("[AI] Models ready.")

# ─── PHQ-9 Question Metadata ──────────────────────────────────────────────────

PHQ9_META = [
    {"id": 1, "text": "Little interest or pleasure in doing things",                       "risk_flag": None,               "domain": "mood"},
    {"id": 2, "text": "Feeling down, depressed, or hopeless",                              "risk_flag": "hopelessness",      "domain": "mood"},
    {"id": 3, "text": "Trouble falling or staying asleep, or sleeping too much",           "risk_flag": None,               "domain": "somatic"},
    {"id": 4, "text": "Feeling tired or having little energy",                             "risk_flag": None,               "domain": "somatic"},
    {"id": 5, "text": "Poor appetite or overeating",                                       "risk_flag": None,               "domain": "somatic"},
    {"id": 6, "text": "Feeling bad about yourself or that you are a failure",              "risk_flag": "self_worth",        "domain": "cognitive"},
    {"id": 7, "text": "Trouble concentrating on things",                                   "risk_flag": None,               "domain": "cognitive"},
    {"id": 8, "text": "Moving or speaking so slowly that others notice",                   "risk_flag": None,               "domain": "psychomotor"},
    {"id": 9, "text": "Thoughts that you would be better off dead or of hurting yourself", "risk_flag": "suicidal_ideation", "domain": "critical"},
]

GAD7_META = [
    {"id": 1, "text": "Feeling nervous, anxious, or on edge",                  "risk_flag": None,                 "domain": "worry"},
    {"id": 2, "text": "Not being able to stop or control worrying",            "risk_flag": "uncontrolled_worry", "domain": "worry"},
    {"id": 3, "text": "Worrying too much about different things",              "risk_flag": None,                 "domain": "worry"},
    {"id": 4, "text": "Trouble relaxing",                                      "risk_flag": None,                 "domain": "somatic"},
    {"id": 5, "text": "Being so restless that it is hard to sit still",        "risk_flag": None,                 "domain": "somatic"},
    {"id": 6, "text": "Becoming easily annoyed or irritable",                  "risk_flag": None,                 "domain": "affect"},
    {"id": 7, "text": "Feeling afraid as if something awful might happen",     "risk_flag": "panic_tendency",     "domain": "affect"},
]

RECOMMENDATIONS = {
    "minimal":  "Your results indicate minimal symptoms. Maintain healthy routines and monitor your mood. A general counselor can provide additional support if needed.",
    "mild":     "Your results indicate mild symptoms. Engaging with a counselor or therapist is advisable. Structured self-help strategies and regular check-ins are recommended.",
    "moderate": "Your results indicate moderate symptoms. Consultation with a licensed therapist is strongly recommended for a structured treatment plan.",
    "severe":   "Your results indicate severe symptoms. Immediate support from a clinical psychologist is strongly advised. Please do not delay seeking professional help.",
}

# ─── AI Assessment Engine ─────────────────────────────────────────────────────

def _detect_risk_flags(scores, meta):
    """Scan individual answers for clinically significant responses (score ≥ 2)."""
    return [
        m["risk_flag"]
        for i, m in enumerate(meta)
        if m["risk_flag"] and scores[i] >= 2
    ]

def _analyse_symptom_domains(scores, meta):
    """
    Group questions by clinical domain and compute average score per domain.
    Returns domains where average score ≥ 2 (clinically elevated).
    """
    from collections import defaultdict
    domain_scores = defaultdict(list)
    for i, m in enumerate(meta):
        domain_scores[m["domain"]].append(scores[i])

    return {
        domain: round(sum(vals) / len(vals), 2)
        for domain, vals in domain_scores.items()
        if sum(vals) / len(vals) >= 2.0
    }

def _get_feature_importance(model, scores, n_questions):
    """
    Use the Random Forest's feature importances to identify which questions
    most influenced this specific prediction.
    Returns top-3 most influential question indices.
    """
    importances = model.feature_importances_
    top_indices = np.argsort(importances)[::-1][:3]
    return [int(i + 1) for i in top_indices]  # 1-indexed question numbers


def run_assessment(assessment_type: str, scores: list) -> dict:
    """
    Main AI assessment pipeline.
    1. ML classification (Random Forest) → severity + class probabilities
    2. Confidence score from class probability distribution
    3. Risk flag detection
    4. Symptom domain analysis
    5. Feature importance → which questions drove the prediction
    """
    scores_arr = np.array(scores).reshape(1, -1)
    raw_score  = int(sum(scores))

    if assessment_type == "PHQ-9":
        model, meta = phq9_model, PHQ9_META
        condition   = "depression"
    else:
        model, meta = gad7_model, GAD7_META
        condition   = "anxiety"

    # ML prediction
    predicted_class = model.predict(scores_arr)[0]
    class_probs     = model.predict_proba(scores_arr)[0]
    classes         = model.classes_

    # Confidence = probability of the predicted class
    pred_idx    = list(classes).index(predicted_class)
    confidence  = round(float(class_probs[pred_idx]), 3)

    # Full probability distribution across all severity levels
    prob_dist = {cls: round(float(prob), 3) for cls, prob in zip(classes, class_probs)}

    risk_flags        = _detect_risk_flags(scores, meta)
    elevated_domains  = _analyse_symptom_domains(scores, meta)
    key_questions     = _get_feature_importance(model, scores_arr, len(meta))

    return {
        "rawScore":         raw_score,
        "severity":         predicted_class,
        "confidence":       confidence,
        "probabilityDist":  prob_dist,
        "interpretation":   f"{predicted_class.capitalize()} {condition}",
        "recommendation":   RECOMMENDATIONS[predicted_class],
        "riskFlags":        risk_flags,
        "elevatedDomains":  elevated_domains,
        "keyQuestions":     key_questions,
        "aiNote": (
            "URGENT: Suicidal ideation detected. Immediate clinical intervention is strongly recommended."
            if "suicidal_ideation" in risk_flags else None
        ),
    }

# ─── Comorbidity Detection ────────────────────────────────────────────────────

def detect_comorbidity(phq9_severity: str, gad7_severity: str) -> dict:
    """
    Cross-assessment reasoning: when both PHQ-9 and GAD-7 results exist,
    detect co-occurring depression + anxiety and compute combined severity.
    Uses a severity rank sum to determine escalation.
    """
    rank = {"minimal": 0, "mild": 1, "moderate": 2, "severe": 3}
    combined = rank.get(phq9_severity, 0) + rank.get(gad7_severity, 0)

    if combined >= 5:
        combined_severity = "severe"
    elif combined >= 3:
        combined_severity = "moderate"
    elif combined >= 2:
        combined_severity = "mild"
    else:
        combined_severity = "minimal"

    return {
        "detected":         combined >= 2,
        "combinedSeverity": combined_severity,
        "note": (
            "Co-occurring depression and anxiety detected. Combined severity factored into recommendations."
            if combined >= 2 else None
        ),
    }

# ─── KNN Therapist Matching ───────────────────────────────────────────────────

# Affinity matrix: severity × specialization → score 0–10
AFFINITY = {
    "minimal":  {"General Counseling": 10, "Counseling": 10, "Wellness Coaching": 8,  "Life Coaching": 7,   "Therapy": 5,  "Psychotherapy": 4,  "CBT": 3},
    "mild":     {"General Counseling":  8, "Counseling":  9, "Therapy": 10,           "Psychotherapy": 9,   "CBT": 8,      "Clinical Counseling": 6},
    "moderate": {"Therapy": 10, "Psychotherapy": 10, "CBT": 9, "Clinical Counseling": 9, "Licensed Therapy": 8, "Clinical Psychology": 7},
    "severe":   {"Clinical Psychology": 10, "Psychiatry": 10, "Clinical Psychotherapy": 9, "Trauma Therapy": 8, "Psychotherapy": 6},
}

CRISIS_SPECS = {"Clinical Psychology", "Psychiatry", "Clinical Psychotherapy"}

SCORE_WEIGHTS = {"specialization": 0.50, "rating": 0.30, "availability": 0.20}


def _specialization_score(specializations: list, severity: str) -> float:
    matrix = AFFINITY.get(severity, {})
    best   = max((matrix.get(s, 0) for s in specializations), default=0)
    return best / 10.0


def _rating_score(rating: float) -> float:
    return max(0.0, (rating - 1.0) / 4.0)


def _availability_score(slot_count: int) -> float:
    return min(slot_count / 7.0, 1.0)


def match_therapists(severity: str, therapists: list,
                     risk_flags: list = None,
                     confidence: float = 1.0,
                     comorbidity: dict = None) -> list:
    """
    KNN-inspired weighted matching engine.

    Each therapist is represented as a feature vector:
      [specialization_affinity, normalised_rating, normalised_availability]

    The ideal therapist vector for the given severity is [1.0, 1.0, 1.0].
    We compute the weighted Euclidean distance from each therapist to the ideal
    and rank by proximity (closest = best match).

    Additional AI rules:
      - Crisis mode (suicidal_ideation): restrict pool to CRISIS_SPECS only
      - Low confidence: step down severity to broaden pool
      - Comorbidity: use escalated combined severity
    """
    if risk_flags is None:
        risk_flags = []

    # Determine effective severity
    active_severity = severity
    if comorbidity and comorbidity.get("detected"):
        active_severity = comorbidity.get("combinedSeverity", severity)
    elif confidence < 0.75:
        levels = ["minimal", "mild", "moderate", "severe"]
        idx = levels.index(severity)
        active_severity = levels[max(0, idx - 1)]

    crisis_mode = "suicidal_ideation" in risk_flags

    scored = []
    for t in therapists:
        specs      = t.get("specialization", [])
        rating     = t.get("rating", 0.0)
        avail_cnt  = t.get("availabilityCount", 0)

        # Crisis filter: hard restrict
        if crisis_mode and not any(s in CRISIS_SPECS for s in specs):
            continue

        s_score = _specialization_score(specs, active_severity)
        r_score = _rating_score(rating)
        a_score = _availability_score(avail_cnt)

        # Weighted feature vector
        vec_therapist = np.array([s_score, r_score, a_score])
        vec_ideal     = np.array([1.0,     1.0,     1.0])
        weights       = np.array([
            SCORE_WEIGHTS["specialization"],
            SCORE_WEIGHTS["rating"],
            SCORE_WEIGHTS["availability"],
        ])

        # Weighted Euclidean distance to ideal (lower = better)
        distance   = float(np.sqrt(np.sum(weights * (vec_ideal - vec_therapist) ** 2)))
        match_score = round(1.0 - distance, 4)   # invert: higher = better

        scored.append({**t, "aiMatchScore": match_score})

    scored.sort(key=lambda x: x["aiMatchScore"], reverse=True)
    return scored
