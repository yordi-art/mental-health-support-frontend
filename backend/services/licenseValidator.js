/**
 * License Validation Comparator
 * Compares OCR-extracted data against user-provided form input
 */

const CONFIDENCE_THRESHOLD = 0.5; // minimum OCR confidence to trust results
const DATE_TOLERANCE_DAYS = 3;    // allow ±3 days for date matching (OCR date parsing variance)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeString(str) {
  return (str || '').toLowerCase().replace(/[\s\-_.\/]/g, '').trim();
}

function datesMatch(ocrDate, userDate) {
  if (!ocrDate || !userDate) return false;
  const d1 = new Date(ocrDate);
  const d2 = new Date(userDate);
  if (isNaN(d1) || isNaN(d2)) return false;
  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= DATE_TOLERANCE_DAYS;
}

function licenseNumbersMatch(ocr, user) {
  if (!ocr || !user) return false;
  const n1 = normalizeString(ocr);
  const n2 = normalizeString(user);
  if (n1 === n2) return true;
  // Allow partial match — OCR may miss prefix/suffix
  return n1.includes(n2) || n2.includes(n1);
}

function authoritiesMatch(ocr, user) {
  if (!ocr || !user) return false;
  return normalizeString(ocr) === normalizeString(user);
}

// ─── Main Validator ──────────────────────────────────────────────────────────

/**
 * @param {object} extracted  - from licenseExtractor
 * @param {object} userInput  - { licenseNumber, issuingAuthority, licenseExpiryDate }
 * @param {number} confidence - OCR confidence score (0–1)
 * @returns {object} validation result
 */
function validateLicenseData(extracted, userInput, confidence) {
  const result = {
    passed: false,
    confidence,
    checks: {
      licenseNumber: { matched: false, ocr: extracted.licenseNumber, user: userInput.licenseNumber },
      issuingAuthority: { matched: false, ocr: extracted.issuingAuthority, user: userInput.issuingAuthority },
      expiryDate: { matched: false, ocr: extracted.expiryDate, user: userInput.licenseExpiryDate },
    },
    mismatches: [],
    unextracted: extracted.unmatched || [],
    decision: null,
    notes: '',
  };

  // Low confidence — can't trust OCR results
  if (confidence < CONFIDENCE_THRESHOLD) {
    result.decision = 'PENDING';
    result.notes = `OCR confidence too low (${Math.round(confidence * 100)}%). Document may be unclear or low quality. Manual review required.`;
    return result;
  }

  // Run field comparisons only for fields that were successfully extracted
  const extractedFields = extracted.extractedFields || [];

  if (extractedFields.includes('licenseNumber')) {
    result.checks.licenseNumber.matched = licenseNumbersMatch(extracted.licenseNumber, userInput.licenseNumber);
    if (!result.checks.licenseNumber.matched) {
      result.mismatches.push(`License number mismatch: document shows "${extracted.licenseNumber}", you entered "${userInput.licenseNumber}"`);
    }
  }

  if (extractedFields.includes('issuingAuthority')) {
    result.checks.issuingAuthority.matched = authoritiesMatch(extracted.issuingAuthority, userInput.issuingAuthority);
    if (!result.checks.issuingAuthority.matched) {
      result.mismatches.push(`Issuing authority mismatch: document shows "${extracted.issuingAuthority}", you entered "${userInput.issuingAuthority}"`);
    }
  }

  if (extractedFields.includes('expiryDate')) {
    result.checks.expiryDate.matched = datesMatch(extracted.expiryDate, userInput.licenseExpiryDate);
    if (!result.checks.expiryDate.matched) {
      const ocrStr = extracted.expiryDate ? new Date(extracted.expiryDate).toLocaleDateString() : 'unknown';
      const userStr = userInput.licenseExpiryDate ? new Date(userInput.licenseExpiryDate).toLocaleDateString() : 'unknown';
      result.mismatches.push(`Expiry date mismatch: document shows "${ocrStr}", you entered "${userStr}"`);
    }
  }

  // Decision logic
  if (result.mismatches.length > 0) {
    result.decision = 'REJECTED';
    result.notes = `Document data does not match your input. ${result.mismatches.join('. ')}`;
    return result;
  }

  // If OCR couldn't extract some fields, fall back to PENDING not REJECTED
  if (result.unextracted.length > 0 && extractedFields.length < 2) {
    result.decision = 'PENDING';
    result.notes = `Unable to fully verify document automatically. Could not extract: ${result.unextracted.join(', ')}. Submitted for manual review.`;
    return result;
  }

  result.passed = true;
  result.decision = 'OCR_PASSED';
  result.notes = `Document verified via OCR. All extracted fields match your input.`;
  return result;
}

module.exports = { validateLicenseData };
