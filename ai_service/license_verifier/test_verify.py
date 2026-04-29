"""
Test script for the license verifier microservice.
Tests validation_service and ml_service directly (no server required).

Run: python test_verify.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from validation_service import validate
from ml_service import predict, train_and_save

# ── Pre-train model ────────────────────────────────────────────────────────
print("Training ML model...")
train_and_save()
print("Model trained.\n")

# ── Test cases ─────────────────────────────────────────────────────────────
CASES = [
    {
        "name": "✅ Full valid license",
        "text": (
            "Ministry of Health\n"
            "License No: LIC-20241\n"
            "This certifies that Dr. Jane Smith is a Licensed Therapist.\n"
            "Expiry Date: 2027-12-31"
        ),
        "therapist_name": "Jane Smith",
        "expect_status": "approved",
    },
    {
        "name": "⚠️  Missing authority",
        "text": (
            "License No: LIC-20242\n"
            "Dr. John Doe — Licensed Counselor\n"
            "Expiry Date: 2026-06-30"
        ),
        "therapist_name": "John Doe",
        "expect_status": "review_required",
    },
    {
        "name": "❌ Expired license",
        "text": (
            "Ministry of Health\n"
            "License No: LIC-20243\n"
            "Dr. Alice Brown — Licensed Therapist\n"
            "Expiry Date: 2020-01-01"
        ),
        "therapist_name": "Alice Brown",
        "expect_status": "rejected",
    },
    {
        "name": "❌ No document (empty text)",
        "text": "",
        "therapist_name": "Bob Lee",
        "expect_status": "rejected",
    },
    {
        "name": "❌ Name mismatch",
        "text": (
            "Regional Health Bureau\n"
            "License No: RHB-99887\n"
            "Dr. Maria Garcia — Licensed Psychologist\n"
            "Expiry Date: 2028-03-15"
        ),
        "therapist_name": "Wrong Name",
        "expect_status": "review_required",
    },
]

passed = 0
for case in CASES:
    result = validate(case["text"], case["therapist_name"], document_uploaded=bool(case["text"]))

    # ML only for non-rejected
    ml_label = ml_conf = None
    if result.status != "rejected":
        ml_label, ml_conf = predict(result.features)
        blended = round(result.score * 0.7 + ml_conf * 0.3, 4)
        final = "approved" if blended >= 0.8 else "review_required"
    else:
        final = "rejected"
        blended = result.score

    ok = "✓" if final == case["expect_status"] else "✗"
    if final == case["expect_status"]:
        passed += 1

    print(f"{ok} {case['name']}")
    print(f"   rule_score={result.score}  features={result.features}")
    print(f"   ml_prediction={ml_label}  confidence={blended}")
    print(f"   status={final}  (expected={case['expect_status']})")
    if result.issues:
        print(f"   issues={result.issues}")
    print()

print(f"Results: {passed}/{len(CASES)} passed")
