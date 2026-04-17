/**
 * AI Therapist Matching Service — Weighted Recommendation Engine
 * This system uses rule-based AI logic to support decision-making
 * and does not replace professional medical diagnosis.
 *
 * AI Behaviour:
 *  - Multi-factor weighted scoring per therapist candidate
 *  - Severity-to-specialization affinity matrix
 *  - Risk flag escalation: suicidal_ideation forces clinical-only pool
 *  - Comorbidity-aware: adjusts matching when both conditions are present
 *  - Confidence-weighted: lower-confidence assessments broaden the candidate pool
 */

const Therapist = require('../models/Therapist');
const Review    = require('../models/Review');

// ─── Affinity Matrix ──────────────────────────────────────────────────────────
// Each severity maps specializations to an affinity score (0–10).
// Higher = stronger match. The AI uses these as weights, not binary filters.

const AFFINITY_MATRIX = {
  minimal: {
    'General Counseling':   10,
    'Counseling':           10,
    'Wellness Coaching':     8,
    'Life Coaching':         7,
    'Therapy':               5,
    'Psychotherapy':         4,
    'CBT':                   3
  },
  mild: {
    'General Counseling':    8,
    'Counseling':            9,
    'Therapy':              10,
    'Psychotherapy':         9,
    'CBT':                   8,
    'Clinical Counseling':   6,
    'Wellness Coaching':     4
  },
  moderate: {
    'Therapy':              10,
    'Psychotherapy':        10,
    'CBT':                   9,
    'Clinical Counseling':   9,
    'Licensed Therapy':      8,
    'Counseling':            5,
    'Clinical Psychology':   7
  },
  severe: {
    'Clinical Psychology':  10,
    'Psychiatry':           10,
    'Clinical Psychotherapy': 9,
    'Trauma Therapy':        8,
    'Psychotherapy':         6,
    'Licensed Therapy':      5
  }
};

// Specializations that are REQUIRED for severe + suicidal_ideation risk flag
const CRISIS_REQUIRED_SPECS = ['Clinical Psychology', 'Psychiatry', 'Clinical Psychotherapy'];

// ─── Scoring Weights ──────────────────────────────────────────────────────────
// The final AI score for each therapist is a weighted sum of these factors.

const SCORE_WEIGHTS = {
  specialization: 0.50,  // affinity to severity
  rating:         0.30,  // client-rated quality
  availability:   0.20   // breadth of available slots
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

async function getAverageRating(therapistUserId) {
  const reviews = await Review.find({ therapistId: therapistUserId });
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

/**
 * AI: Compute specialization affinity score for a therapist.
 * Takes the highest affinity value across all of the therapist's specializations.
 * Normalised to 0–1.
 */
function specializationScore(therapist, severity) {
  const matrix = AFFINITY_MATRIX[severity] || {};
  const specs   = therapist.specialization || [];
  const best    = specs.reduce((max, s) => {
    const affinity = matrix[s] ?? 0;
    return affinity > max ? affinity : max;
  }, 0);
  return best / 10; // normalise to 0–1
}

/**
 * AI: Normalise rating to 0–1 (ratings are 1–5).
 */
function ratingScore(rating) {
  return (rating - 1) / 4;
}

/**
 * AI: Normalise availability breadth to 0–1.
 * More available days = higher score, capped at 7.
 */
function availabilityScore(therapist) {
  const slots = therapist.availability?.length ?? 0;
  return Math.min(slots / 7, 1);
}

/**
 * AI: Compute final weighted match score for a therapist.
 */
function computeMatchScore(therapist, rating, severity) {
  const s = specializationScore(therapist, severity);
  const r = ratingScore(rating);
  const a = availabilityScore(therapist);
  return (
    s * SCORE_WEIGHTS.specialization +
    r * SCORE_WEIGHTS.rating         +
    a * SCORE_WEIGHTS.availability
  );
}

/**
 * AI: Widen candidate pool when assessment confidence is low.
 * Low confidence means the score is near a threshold boundary —
 * the AI should not be too restrictive in that case.
 */
function effectiveSeverity(severity, confidence) {
  if (confidence >= 0.75) return severity;
  // Step down one level to broaden the pool
  const levels = ['minimal', 'mild', 'moderate', 'severe'];
  const idx = levels.indexOf(severity);
  return idx > 0 ? levels[idx - 1] : severity;
}

// ─── Matching Service ─────────────────────────────────────────────────────────

class MatchingService {
  /**
   * AI Recommendation Engine.
   * @param {string}   severity    - from assessment result
   * @param {string[]} riskFlags   - detected risk signals (e.g. ['suicidal_ideation'])
   * @param {number}   confidence  - AI confidence score 0–1
   * @param {object}   comorbidity - comorbidity detection result (optional)
   */
  static async recommend(severity, riskFlags = [], confidence = 1.0, comorbidity = null) {
    // If comorbidity escalated severity, use that
    const activeSeverity = comorbidity?.detected
      ? comorbidity.combinedSeverity
      : effectiveSeverity(severity, confidence);

    // Crisis mode: suicidal ideation forces clinical-only pool
    const crisisMode = riskFlags.includes('suicidal_ideation');

    // Build base query: VERIFIED + has availability
    const query = {
      'verification.status': 'VERIFIED',
      'availability.0': { $exists: true }
    };

    // In crisis mode, restrict to crisis-capable specializations only
    if (crisisMode) {
      query.specialization = { $in: CRISIS_REQUIRED_SPECS };
    }

    const therapists = await Therapist.find(query)
      .populate('userId', 'name email profileImage');

    // Score every candidate
    const scored = await Promise.all(
      therapists.map(async (t) => {
        const rating     = await getAverageRating(t.userId._id);
        const matchScore = computeMatchScore(t, rating, activeSeverity);
        return { therapist: t, rating, matchScore };
      })
    );

    // Sort by AI match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored.map(({ therapist: t, rating, matchScore }) => ({
      id:              t._id,
      name:            t.userId.name,
      email:           t.userId.email,
      profileImage:    t.userId.profileImage || null,
      specialization:  t.specialization,
      experienceYears: t.experienceYears,
      hourlyRate:      t.hourlyRate,
      rating:          Math.round(rating * 10) / 10,
      availability:    t.availability,
      aiMatchScore:    Math.round(matchScore * 100) / 100,  // expose AI score for transparency
      bookingOption:   true
    }));
  }
}

module.exports = MatchingService;
