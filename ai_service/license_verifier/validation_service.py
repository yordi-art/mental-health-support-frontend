"""
Validation Service — PRIMARY rule-based license verification.

Scoring:
  expiry_valid        → +0.3
  license_format_valid → +0.2
  authority_found     → +0.2
  name_match          → +0.2
  document_uploaded   → +0.1

Classification:
  score >= 0.8  → approved
  score >= 0.5  → review_required
  score <  0.5  → rejected

This system uses AI-assisted validation. Final verification should not replace
official regulatory approval.
"""

import re
from datetime import date, datetime
from typing import NamedTuple

VALID_AUTHORITIES = {"ministry of health", "regional health bureau", "regional bureau of health"}

LICENSE_PATTERN = re.compile(
    r"\b([A-Z]{2,4}[-/]?\d{4,8}|LIC[-/]?\d{4,8}|\d{6,10})\b"
)

DATE_PATTERNS = [
    r"\b(\d{4}[-/]\d{2}[-/]\d{2})\b",          # 2026-12-31
    r"\b(\d{2}[-/]\d{2}[-/]\d{4})\b",          # 31/12/2026
    r"\b(\w+ \d{1,2},? \d{4})\b",              # December 31, 2026
]
DATE_FORMATS = ["%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%d-%m-%Y",
                "%B %d %Y", "%B %d, %Y", "%b %d %Y", "%b %d, %Y"]


class ValidationResult(NamedTuple):
    score: float
    status: str
    features: list[int]   # [expiry_valid, license_format_valid, authority_found, name_match, document_uploaded]
    issues: list[str]


def validate(text: str, therapist_name: str, document_uploaded: bool) -> ValidationResult:
    issues: list[str] = []
    text_lower = text.lower()

    # ── document_uploaded ──────────────────────────────────────────────────
    doc_flag = int(document_uploaded and bool(text.strip()))
    if not doc_flag:
        issues.append("no document uploaded or document is empty")

    # ── expiry_valid ───────────────────────────────────────────────────────
    expiry_flag = 0
    expiry_date = _extract_expiry(text)
    if expiry_date:
        if expiry_date > date.today():
            expiry_flag = 1
        else:
            issues.append(f"license expired on {expiry_date}")
    else:
        issues.append("expiry date not found in document")

    # ── license_format_valid ───────────────────────────────────────────────
    license_flag = int(bool(LICENSE_PATTERN.search(text)))
    if not license_flag:
        issues.append("license number format not recognized")

    # ── authority_found ────────────────────────────────────────────────────
    authority_flag = int(any(auth in text_lower for auth in VALID_AUTHORITIES))
    if not authority_flag:
        issues.append("issuing authority not clearly detected")

    # ── name_match ─────────────────────────────────────────────────────────
    name_flag = _name_match(therapist_name, text_lower)
    if not name_flag:
        issues.append(f"therapist name '{therapist_name}' not found in document")

    features = [expiry_flag, license_flag, authority_flag, name_flag, doc_flag]
    score = round(
        expiry_flag * 0.3
        + license_flag * 0.2
        + authority_flag * 0.2
        + name_flag * 0.2
        + doc_flag * 0.1,
        2,
    )

    # Hard-reject rules: expired or missing document always → rejected
    if not expiry_flag or not doc_flag:
        return ValidationResult(score, "rejected", features, issues)

    status = _classify(score)
    return ValidationResult(score, status, features, issues)


# ── helpers ────────────────────────────────────────────────────────────────

def _extract_expiry(text: str) -> date | None:
    # Look for "expir" context first, then fall back to any date
    for pattern in DATE_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            raw = match.group(1).replace(",", "")
            for fmt in DATE_FORMATS:
                try:
                    return datetime.strptime(raw, fmt).date()
                except ValueError:
                    continue
    return None


def _name_match(name: str, text_lower: str) -> int:
    name = name.strip().lower()
    if name in text_lower:
        return 1
    # Partial: all parts of the name present
    parts = name.split()
    return int(len(parts) > 1 and all(p in text_lower for p in parts))


def _classify(score: float) -> str:
    if score >= 0.8:
        return "approved"
    if score >= 0.5:
        return "review_required"
    return "rejected"
