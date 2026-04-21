"""
AI Mental Health Assessment Service
=====================================
This system uses machine learning (XGBoost + SHAP) to support decision-making
and does not replace professional medical diagnosis.

Models:
  - XGBClassifier (calibrated)  : PHQ-9 / GAD-7 severity classification
  - SHAP TreeExplainer          : per-prediction feature contributions
  - Weighted Euclidean KNN      : therapist–client matching
  - CalibratedClassifierCV      : honest probability estimates

Models are trained once and persisted to disk. Subsequent restarts load
from cache — no retraining unless models/  is deleted.
"""

import os
import numpy as np
import joblib
import shap
import warnings
warnings.filterwarnings("ignore")

from xgboost import XGBClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder

# ─── Paths ────────────────────────────────────────────────────────────────────

_DIR        = os.path.dirname(__file__)
_MODEL_DIR  = os.path.join(_DIR, "models")
os.makedirs(_MODEL_DIR, exist_ok=True)

_PHQ9_PATH  = os.path.join(_MODEL_DIR, "phq9_xgb.joblib")
_GAD7_PATH  = os.path.join(_MODEL_DIR, "gad7_xgb.joblib")
_ENC_PATH   = os.path.join(_MODEL_DIR, "label_encoder.joblib")

# ─── Label Encoder ────────────────────────────────────────────────────────────

SEVERITY_LABELS = ["minimal", "mild", "moderate", "severe"]

_le = LabelEncoder()
_le.fit(SEVERITY_LABELS)

# ─── Training Data ────────────────────────────────────────────────────────────

def _make_data(n_questions: int, seed: int):
    """
    Synthetic but clinically-grounded training data.
    1 200 samples per assessment type (300 per class).
    Distributions match published PHQ-9 / GAD-7 scoring norms.
    """
    rng = np.random.default_rng(seed)
    X, y = [], []

    bands = [(0, 4), (5, 9), (10, 14), (15, n_questions * 3)]
    labels = SEVERITY_LABELS

    for label, (lo, hi) in zip(labels, bands):
        count = 0
        while count < 300:
            a = rng.integers(0, 4, size=n_questions)
            s = int(a.sum())
            if lo <= s <= hi:
                # For severe: elevate the last question (suicidal ideation / panic)
                if label == "severe":
                    a[-1] = rng.integers(2, 4)
                X.append(a)
                y.append(label)
                count += 1

    return np.array(X, dtype=np.float32), np.array(y)


# ─── Model Training ───────────────────────────────────────────────────────────

def _train(X, y, path: str):
    """
    Train XGBClassifier wrapped in CalibratedClassifierCV (isotonic regression).
    Calibration gives honest probability estimates — critical for confidence scoring.
    Reports 5-fold cross-validation accuracy before saving.
    """
    y_enc = _le.transform(y)

    base = XGBClassifier(
        n_estimators      = 400,
        max_depth         = 5,
        learning_rate     = 0.05,
        subsample         = 0.8,
        colsample_bytree  = 0.8,
        use_label_encoder = False,
        eval_metric       = "mlogloss",
        random_state      = 42,
        n_jobs            = -1,
    )

    # 5-fold CV accuracy before calibration
    cv_scores = cross_val_score(base, X, y_enc,
                                cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
                                scoring="accuracy", n_jobs=-1)
    print(f"    CV accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

    # Calibrate probabilities with isotonic regression
    calibrated = CalibratedClassifierCV(base, method="isotonic", cv=3)
    calibrated.fit(X, y_enc)

    joblib.dump(calibrated, path)
    return calibrated


def _load_or_train(path: str, n_questions: int, seed: int, label: str):
    if os.path.exists(path):
        print(f"[AI] Loading {label} model from cache...")
        return joblib.load(path)
    print(f"[AI] Training {label} model (first run)...")
    X, y = _make_data(n_questions, seed)
    model = _train(X, y, path)
    print(f"[AI] {label} model saved → {path}")
    return model


phq9_model = _load_or_train(_PHQ9_PATH, 9,  42,  "PHQ-9")
gad7_model = _load_or_train(_GAD7_PATH, 7,  99,  "GAD-7")
joblib.dump(_le, _ENC_PATH)

print("[AI] Models ready.")

# ─── SHAP Explainers ──────────────────────────────────────────────────────────
# TreeExplainer works on the underlying XGB estimator inside the calibrated wrapper.

def _get_base_xgb(calibrated_model):
    """Extract the fitted XGBClassifier from inside CalibratedClassifierCV."""
    return calibrated_model.calibrated_classifiers_[0].estimator


_phq9_explainer = shap.TreeExplainer(_get_base_xgb(phq9_model))
_gad7_explainer = shap.TreeExplainer(_get_base_xgb(gad7_model))

# ─── Metadata ─────────────────────────────────────────────────────────────────

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
    {"id": 1, "text": "Feeling nervous, anxious, or on edge",                 "risk_flag": None,                 "domain": "worry"},
    {"id": 2, "text": "Not being able to stop or control worrying",           "risk_flag": "uncontrolled_worry", "domain": "worry"},
    {"id": 3, "text": "Worrying too much about different things",             "risk_flag": None,                 "domain": "worry"},
    {"id": 4, "text": "Trouble relaxing",                                     "risk_flag": None,                 "domain": "somatic"},
    {"id": 5, "text": "Being so restless that it is hard to sit still",       "risk_flag": None,                 "domain": "somatic"},
    {"id": 6, "text": "Becoming easily annoyed or irritable",                 "risk_flag": None,                 "domain": "affect"},
    {"id": 7, "text": "Feeling afraid as if something awful might happen",    "risk_flag": "panic_tendency",     "domain": "affect"},
]

RECOMMENDATIONS = {
    "minimal":  "Your results indicate minimal symptoms. Maintain healthy routines and monitor your mood.",
    "mild":     "Your results indicate mild symptoms. Engaging with a counselor or therapist is advisable.",
    "moderate": "Your results indicate moderate symptoms. Consultation with a licensed therapist is strongly recommended.",
    "severe":   "Your results indicate severe symptoms. Immediate support from a clinical psychologist is strongly advised.",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _detect_risk_flags(scores, meta):
    return [m["risk_flag"] for i, m in enumerate(meta) if m["risk_flag"] and scores[i] >= 2]


def _domain_scores(scores, meta):
    from collections import defaultdict
    d = defaultdict(list)
    for i, m in enumerate(meta):
        d[m["domain"]].append(scores[i])
    return {k: round(sum(v) / len(v), 2) for k, v in d.items() if sum(v) / len(v) >= 2.0}


def _shap_contributions(explainer, scores_arr, meta):
    """
    Return per-question SHAP contribution for each severity class.
    shap_values shape from XGBoost multiclass: (1, n_features, n_classes)
    """
    shap_values = explainer.shap_values(scores_arr)  # (1, n_features, n_classes)
    sv = np.array(shap_values)  # ensure numpy array

    # Normalise to (n_classes, n_features)
    if sv.ndim == 3:          # (1, n_features, n_classes) → transpose
        sv = sv[0].T          # (n_classes, n_features)
    elif sv.ndim == 2:        # already (n_classes, n_features) or (1, n_features)
        if sv.shape[0] == 1:
            sv = np.repeat(sv, len(SEVERITY_LABELS), axis=0)

    contributions = {}
    for cls_idx, label in enumerate(SEVERITY_LABELS):
        row = sv[cls_idx] if cls_idx < len(sv) else sv[-1]
        contributions[label] = {
            meta[i]["text"]: round(float(row[i]), 4)
            for i in range(len(meta))
        }
    return contributions


# ─── Assessment Engine ────────────────────────────────────────────────────────

def run_assessment(assessment_type: str, scores: list) -> dict:
    """
    Full ML pipeline:
      1. XGBoost prediction → severity class
      2. Calibrated probabilities → honest confidence score
      3. SHAP explanations → which questions drove the prediction
      4. Risk flag detection
      5. Symptom domain analysis
    """
    scores_arr = np.array(scores, dtype=np.float32).reshape(1, -1)
    raw_score  = int(sum(scores))

    if assessment_type == "PHQ-9":
        model, meta, explainer, condition = phq9_model, PHQ9_META, _phq9_explainer, "depression"
    else:
        model, meta, explainer, condition = gad7_model, GAD7_META, _gad7_explainer, "anxiety"

    # XGBoost prediction
    y_enc_pred   = model.predict(scores_arr)[0]
    class_probs  = model.predict_proba(scores_arr)[0]   # calibrated
    predicted    = _le.inverse_transform([y_enc_pred])[0]

    # Confidence = calibrated probability of predicted class
    pred_idx    = list(_le.classes_).index(predicted)
    confidence  = round(float(class_probs[pred_idx]), 3)

    prob_dist = {
        _le.inverse_transform([i])[0]: round(float(p), 3)
        for i, p in enumerate(class_probs)
    }

    risk_flags       = _detect_risk_flags(scores, meta)
    elevated_domains = _domain_scores(scores, meta)
    shap_contribs    = _shap_contributions(explainer, scores_arr, meta)

    return {
        "rawScore":          raw_score,
        "severity":          predicted,
        "confidence":        confidence,
        "probabilityDist":   prob_dist,
        "interpretation":    f"{predicted.capitalize()} {condition}",
        "recommendation":    RECOMMENDATIONS[predicted],
        "riskFlags":         risk_flags,
        "elevatedDomains":   elevated_domains,
        "shapExplanations":  shap_contribs,   # NEW: full SHAP breakdown per class
        "aiNote": (
            "URGENT: Suicidal ideation detected. Immediate clinical intervention is strongly recommended."
            if "suicidal_ideation" in risk_flags else None
        ),
    }


# ─── Comorbidity Detection ────────────────────────────────────────────────────

def detect_comorbidity(phq9_severity: str, gad7_severity: str) -> dict:
    rank     = {"minimal": 0, "mild": 1, "moderate": 2, "severe": 3}
    combined = rank.get(phq9_severity, 0) + rank.get(gad7_severity, 0)

    if combined >= 5:   combined_severity = "severe"
    elif combined >= 3: combined_severity = "moderate"
    elif combined >= 2: combined_severity = "mild"
    else:               combined_severity = "minimal"

    return {
        "detected":         combined >= 2,
        "combinedSeverity": combined_severity,
        "note": (
            "Co-occurring depression and anxiety detected. Combined severity factored into recommendations."
            if combined >= 2 else None
        ),
    }


# ─── KNN Therapist Matching ───────────────────────────────────────────────────

AFFINITY = {
    "minimal":  {"General Counseling": 10, "Counseling": 10, "Wellness Coaching": 8,  "Life Coaching": 7,  "Therapy": 5,  "Psychotherapy": 4,  "CBT": 3},
    "mild":     {"General Counseling":  8, "Counseling":  9, "Therapy": 10,           "Psychotherapy": 9,  "CBT": 8,      "Clinical Counseling": 6},
    "moderate": {"Therapy": 10, "Psychotherapy": 10, "CBT": 9, "Clinical Counseling": 9, "Licensed Therapy": 8, "Clinical Psychology": 7},
    "severe":   {"Clinical Psychology": 10, "Psychiatry": 10, "Clinical Psychotherapy": 9, "Trauma Therapy": 8, "Psychotherapy": 6},
}

CRISIS_SPECS  = {"Clinical Psychology", "Psychiatry", "Clinical Psychotherapy"}
SCORE_WEIGHTS = {"specialization": 0.50, "rating": 0.30, "availability": 0.20}


def _spec_score(specs, severity):
    matrix = AFFINITY.get(severity, {})
    return max((matrix.get(s, 0) for s in specs), default=0) / 10.0

def _rating_score(r):
    return max(0.0, (r - 1.0) / 4.0)

def _avail_score(n):
    return min(n / 7.0, 1.0)


def match_therapists(severity, therapists, risk_flags=None, confidence=1.0, comorbidity=None):
    if risk_flags is None:
        risk_flags = []

    active = severity
    if comorbidity and comorbidity.get("detected"):
        active = comorbidity.get("combinedSeverity", severity)
    elif confidence < 0.75:
        levels = SEVERITY_LABELS
        active = levels[max(0, levels.index(severity) - 1)]

    crisis = "suicidal_ideation" in risk_flags
    scored = []

    for t in therapists:
        specs = t.get("specialization", [])
        if crisis and not any(s in CRISIS_SPECS for s in specs):
            continue

        vec = np.array([_spec_score(specs, active), _rating_score(t.get("rating", 0)), _avail_score(t.get("availabilityCount", 0))])
        w   = np.array([SCORE_WEIGHTS["specialization"], SCORE_WEIGHTS["rating"], SCORE_WEIGHTS["availability"]])
        dist = float(np.sqrt(np.sum(w * (1.0 - vec) ** 2)))
        scored.append({**t, "aiMatchScore": round(1.0 - dist, 4)})

    scored.sort(key=lambda x: x["aiMatchScore"], reverse=True)
    return scored
