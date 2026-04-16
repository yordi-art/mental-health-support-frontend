/**
 * License Data Extractor
 * Parses OCR raw text to extract structured license fields using regex patterns
 */

// ─── Patterns ────────────────────────────────────────────────────────────────

// License number patterns (Ethiopian formats + generic fallback)
const LICENSE_NUMBER_PATTERNS = [
  /\b(ETH[-\s]?[A-Z]{2,4}[-\s]?\d{4}[-\s]?\d{2,6})\b/i,   // ETH-PSY-2024-0001
  /\bLIC(?:ENSE)?[:\s#.-]*([A-Z0-9]{4,20})\b/i,             // LICENSE: XXXXX
  /\bREG(?:ISTRATION)?[:\s#.-]*([A-Z0-9]{4,20})\b/i,        // REG: XXXXX
  /\bNO[.:\s]+([A-Z0-9]{4,20})\b/i,                         // No. XXXXX
  /\b([A-Z]{2,4}\/\d{4,6}\/[A-Z]{2,4})\b/,                 // XX/12345/XX
  /\b([A-Z]{2,4}-\d{4}-\d{2,6})\b/,                        // XX-2024-001
];

// Issuing authority patterns
const AUTHORITY_PATTERNS = [
  { pattern: /ministry\s+of\s+health/i,          value: 'Ministry of Health' },
  { pattern: /federal\s+ministry\s+of\s+health/i, value: 'Ministry of Health' },
  { pattern: /regional\s+bureau\s+of\s+health/i,  value: 'Regional Bureau of Health' },
  { pattern: /health\s+bureau/i,                  value: 'Regional Bureau of Health' },
  { pattern: /bureau\s+of\s+health/i,             value: 'Regional Bureau of Health' },
  { pattern: /MOH\b/,                             value: 'Ministry of Health' },
  { pattern: /RBH\b/,                             value: 'Regional Bureau of Health' },
];

// Date patterns — handles DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, written months
const DATE_PATTERNS = [
  /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,                          // DD/MM/YYYY or MM/DD/YYYY
  /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,                          // YYYY-MM-DD
  /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i, // 15 Jan 2027
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i, // Jan 15, 2027
];

// Expiry context keywords — look for dates near these words
const EXPIRY_KEYWORDS = /expir[yed]|valid\s+until|valid\s+through|expires?|expiry|renewal|renew\s+by|end\s+date/i;

const MONTHS = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  str = str.trim();

  // YYYY-MM-DD
  let m = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);

  // DD/MM/YYYY
  m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) {
    const d1 = new Date(+m[3], +m[2] - 1, +m[1]);
    const d2 = new Date(+m[3], +m[1] - 1, +m[2]);
    // Prefer the one where day <= 31 and month <= 12
    return (+m[1] <= 12 && +m[2] > 12) ? d2 : d1;
  }

  // 15 Jan 2027 or Jan 15, 2027
  m = str.match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/i) ||
      str.match(/([A-Za-z]{3})[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i);
  if (m) {
    const monthStr = (m[2] || m[1]).toLowerCase().slice(0, 3);
    const month = MONTHS[monthStr];
    if (month !== undefined) {
      const day = parseInt(m[1].match(/\d/) ? m[1] : m[2]);
      const year = parseInt(m[3]);
      return new Date(year, month, day);
    }
  }

  return null;
}

function extractDatesNearKeyword(text, keyword) {
  const lines = text.split('\n');
  const results = [];
  lines.forEach((line, i) => {
    if (keyword.test(line)) {
      // Check this line and the next 2 lines for a date
      const chunk = lines.slice(i, i + 3).join(' ');
      for (const pattern of DATE_PATTERNS) {
        const m = chunk.match(pattern);
        if (m) {
          const d = parseDate(m[0]);
          if (d) results.push(d);
        }
      }
    }
  });
  return results;
}

// ─── Main Extractor ──────────────────────────────────────────────────────────

function extractLicenseData(rawText) {
  const text = rawText || '';
  const result = {
    licenseNumber: null,
    issuingAuthority: null,
    expiryDate: null,
    extractedFields: [],
    unmatched: [],
  };

  // 1. Extract license number
  for (const pattern of LICENSE_NUMBER_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      result.licenseNumber = (m[1] || m[0]).trim().toUpperCase().replace(/\s+/g, '-');
      result.extractedFields.push('licenseNumber');
      break;
    }
  }
  if (!result.licenseNumber) result.unmatched.push('licenseNumber');

  // 2. Extract issuing authority
  for (const { pattern, value } of AUTHORITY_PATTERNS) {
    if (pattern.test(text)) {
      result.issuingAuthority = value;
      result.extractedFields.push('issuingAuthority');
      break;
    }
  }
  if (!result.issuingAuthority) result.unmatched.push('issuingAuthority');

  // 3. Extract expiry date — prefer dates near expiry keywords
  const expiryDates = extractDatesNearKeyword(text, EXPIRY_KEYWORDS);
  if (expiryDates.length > 0) {
    // Pick the latest date found near expiry keywords
    result.expiryDate = new Date(Math.max(...expiryDates.map(d => d.getTime())));
    result.extractedFields.push('expiryDate');
  } else {
    // Fallback: find all dates in text and pick the latest future one
    const allDates = [];
    for (const pattern of DATE_PATTERNS) {
      const matches = [...text.matchAll(new RegExp(pattern.source, 'gi'))];
      matches.forEach(m => {
        const d = parseDate(m[0]);
        if (d && d > new Date()) allDates.push(d);
      });
    }
    if (allDates.length > 0) {
      result.expiryDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      result.extractedFields.push('expiryDate');
    } else {
      result.unmatched.push('expiryDate');
    }
  }

  return result;
}

module.exports = { extractLicenseData, parseDate };
