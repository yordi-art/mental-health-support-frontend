"""
ML Service — SECONDARY support for license verification.

Trains a LogisticRegression on rule-based features.
ML prediction NEVER overrides a rule-based rejection.

This system uses AI-assisted validation. Final verification should not replace
official regulatory approval.
"""

import os
import csv
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "lr_model.joblib")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "models", "lr_encoder.joblib")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset.csv")

LABELS = ["rejected", "review_required", "approved"]


def train_and_save() -> None:
    X, y = _load_dataset()
    le = LabelEncoder().fit(LABELS)
    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(X, le.transform(y))
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)


def predict(features: list[int]) -> tuple[str, float]:
    """
    Returns (label, confidence).
    Loads model lazily; trains from dataset if model file is absent.
    """
    if not os.path.exists(MODEL_PATH):
        train_and_save()

    model: LogisticRegression = joblib.load(MODEL_PATH)
    le: LabelEncoder = joblib.load(ENCODER_PATH)

    X = np.array(features).reshape(1, -1)
    proba = model.predict_proba(X)[0]
    idx = int(np.argmax(proba))
    label = le.inverse_transform([idx])[0]
    confidence = round(float(proba[idx]), 4)
    return label, confidence


# ── helpers ────────────────────────────────────────────────────────────────

def _load_dataset() -> tuple[np.ndarray, list[str]]:
    X, y = [], []
    with open(DATASET_PATH, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            X.append([int(row[c]) for c in
                       ("expiry_valid", "license_format_valid",
                        "authority_found", "name_match", "document_uploaded")])
            y.append(row["label"])
    return np.array(X), y
