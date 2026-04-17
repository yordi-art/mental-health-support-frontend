/**
 * AI Assessment Service — PHQ-9 & GAD-7
 * This system uses rule-based AI logic to support decision-making
 * and does not replace professional medical diagnosis.
 *
 * AI Behaviour:
 *  - Weighted scoring: critical questions carry higher weight
 *  - Risk flag detection: surfaces specific danger signals
 *  - Confidence scoring: measures classification certainty
 *  - Pattern analysis: detects symptom clusters beyond raw totals
 *  - Comorbidity detection: cross-assessment reasoning when both PHQ-9 & GAD-7 are present
 */

// ─── Question Definitions ────────────────────────────────────────────────────

const PHQ9_QUESTIONS = [
  { id: 1,  text: 'Little interest or pleasure in doing things',                    weight: 1.0, riskFlag: null },
  { id: 2,  text: 'Feeling down, depressed, or hopeless',                           weight: 1.2, riskFlag: 'hopelessness' },
  { id: 3,  text: 'Trouble falling or staying asleep, or sleeping too much',        weight: 1.0, riskFlag: null },
  { id: 4,  text: 'Feeling tired or having little energy',                          weight: 1.0, riskFlag: null },
  { id: 5,  text: 'Poor appetite or overeating',                                    weight: 1.0, riskFlag: null },
  { id: 6,  text: 'Feeling bad about yourself or that you are a failure',           weight: 1.1, riskFlag: 'self_worth' },
  { id: 7,  text: 'Trouble concentrating on things',                                weight: 1.0, riskFlag: null },
  { id: 8,  text: 'Moving or speaking so slowly that others notice',                weight: 1.0, riskFlag: null },
  { id: 9,  text: 'Thoughts that you would be better off dead or of hurting yourself', weight: 2.0, riskFlag: 'suicidal_ideation' }
];

const GAD7_QUESTIONS = [
  { id: 1, text: 'Feeling nervous, anxious, or on edge',                            weight: 1.0, riskFlag: null },
  { id: 2, text: 'Not being able to stop or control worrying',                      weight: 1.1, riskFlag: 'uncontrolled_worry' },
  { id: 3, text: 'Worrying too much about different things',                        weight: 1.0, riskFlag: null },
  { id: 4, text: 'Trouble relaxing',                                                weight: 1.0, riskFlag: null },
  { id: 5, text: 'Being so restless that it is hard to sit still',                  weight: 1.0, riskFlag: null },
  { id: 6, text: 'Becoming easily annoyed or irritable',                            weight: 1.0, riskFlag: null },
  { id: 7, text: 'Feeling afraid as if something awful might happen',               weight: 1.2, riskFlag: 'panic_tendency' }
];

const ANSWER_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

// ─── Severity Thresholds ─────────────────────────────────────────────────────

// Both PHQ-9 and GAD-7 share the same clinical thresholds per spec
const THRESHOLDS = [4, 9, 14]; // minimal ≤4, mild ≤9, moderate ≤14, severe >14
const SEVERITY_LEVELS = ['minimal', 'mild', 'moderate', 'severe'];

// ─── Recommendation Messages ─────────────────────────────────────────────────

const RECOMMENDATIONS = {
  minimal: 'Your results indicate minimal symptoms. Maintain healthy routines, practice self-care, and monitor your mood. A general counselor can provide additional support if needed.',
  mild:     'Your results indicate mild symptoms. Engaging with a counselor or therapist is advisable. Structured self-help strategies and regular check-ins are recommended.',
  moderate: 'Your results indicate moderate symptoms. Consultation with a licensed therapist is strongly recommended for a structured treatment plan and professional support.',
  severe:   'Your results indicate severe symptoms. Immediate support from a clinical psychologist is strongly advised. Please do not delay seeking professional help.'
};

// ─── AI Core Functions ────────────────────────────────────────────────────────

/**
 * AI Step 1 — Weighted Score Calculation
 * Applies per-question weights so clinically critical items
 * (e.g. suicidal ideation) have greater influence on the total.
 */
function computeWeightedScore(answers, questions) {
  let weightedTotal = 0;
  let maxPossible = 0;

  questions.forEach((q, i) => {
    const raw = answers[i]?.score ?? 0;
    weightedTotal += raw * q.weight;
    maxPossible   += 3 * q.weight;
  });

  // Normalise back to the original 0–27 (PHQ-9) or 0–21 (GAD-7) scale
  // so clinical thresholds remain valid
  const rawMax = questions.length * 3;
  const normalisedScore = Math.round((weightedTotal / maxPossible) * rawMax);

  return { weightedTotal: Math.round(weightedTotal * 10) / 10, normalisedScore };
}

/**
 * AI Step 2 — Severity Classification
 * Maps normalised score to a severity level using clinical thresholds.
 */
function classifySeverity(normalisedScore) {
  if (normalisedScore <= THRESHOLDS[0]) return SEVERITY_LEVELS[0];
  if (normalisedScore <= THRESHOLDS[1]) return SEVERITY_LEVELS[1];
  if (normalisedScore <= THRESHOLDS[2]) return SEVERITY_LEVELS[2];
  return SEVERITY_LEVELS[3];
}

/**
 * AI Step 3 — Confidence Scoring
 * Measures how far the score sits from the nearest threshold boundary.
 * A score deep inside a band = high confidence; near a boundary = lower confidence.
 * Returns a value 0.0–1.0.
 */
function computeConfidence(normalisedScore, severity) {
  const idx = SEVERITY_LEVELS.indexOf(severity);
  const lower = idx === 0 ? 0          : THRESHOLDS[idx - 1] + 1;
  const upper = idx === 3 ? normalisedScore + 10 : THRESHOLDS[idx];  // severe has no upper cap
  const bandWidth = upper - lower || 1;
  const distFromEdge = Math.min(normalisedScore - lower, upper - normalisedScore);
  const confidence = Math.min(1, (distFromEdge / bandWidth) * 2 + 0.5);
  return Math.round(confidence * 100) / 100;
}

/**
 * AI Step 4 — Risk Flag Detection
 * Scans individual answers for clinically significant responses.
 * Any flagged question answered ≥2 is surfaced as an active risk signal.
 */
function detectRiskFlags(answers, questions) {
  const flags = [];
  questions.forEach((q, i) => {
    if (q.riskFlag && (answers[i]?.score ?? 0) >= 2) {
      flags.push(q.riskFlag);
    }
  });
  return flags;
}

/**
 * AI Step 5 — Symptom Cluster Analysis
 * Identifies which symptom domains are most elevated.
 * Groups questions into clusters and returns clusters scoring above threshold.
 */
function analyseSymptomClusters(answers, questions, type) {
  const clusters = type === 'PHQ-9'
    ? {
        mood:        [0, 1],   // anhedonia, depressed mood
        somatic:     [2, 3, 4], // sleep, energy, appetite
        cognitive:   [5, 6],   // self-worth, concentration
        psychomotor: [7],
        critical:    [8]       // suicidal ideation
      }
    : {
        worry:    [0, 1, 2],  // nervousness, uncontrolled worry, excessive worry
        somatic:  [3, 4],     // relaxation, restlessness
        affect:   [5, 6]      // irritability, fear
      };

  const elevated = [];
  for (const [cluster, indices] of Object.entries(clusters)) {
    const avg = indices.reduce((s, i) => s + (answers[i]?.score ?? 0), 0) / indices.length;
    if (avg >= 2) elevated.push(cluster);
  }
  return elevated;
}

/**
 * AI Step 6 — Comorbidity Detection (cross-assessment reasoning)
 * When both PHQ-9 and GAD-7 results are available, the AI detects
 * co-occurring depression + anxiety and escalates severity if warranted.
 */
function detectComorbidity(phq9Result, gad7Result) {
  if (!phq9Result || !gad7Result) return null;

  const severityRank = { minimal: 0, mild: 1, moderate: 2, severe: 3 };
  const combined = severityRank[phq9Result.severity] + severityRank[gad7Result.severity];

  let comorbidSeverity = phq9Result.severity; // default to depression severity
  if (combined >= 5) comorbidSeverity = 'severe';
  else if (combined >= 3) comorbidSeverity = 'moderate';

  return {
    detected: combined >= 2,
    combinedSeverity: comorbidSeverity,
    note: combined >= 2
      ? 'Co-occurring depression and anxiety symptoms detected. Combined severity has been factored into therapist recommendations.'
      : null
  };
}

// ─── Main AI Engine ───────────────────────────────────────────────────────────

function runAIAssessment(answers, questions, conditionLabel) {
  const rawScore = answers.reduce((s, a) => s + (a.score ?? 0), 0);
  const { weightedTotal, normalisedScore } = computeWeightedScore(answers, questions);
  const severity   = classifySeverity(normalisedScore);
  const confidence = computeConfidence(normalisedScore, severity);
  const riskFlags  = detectRiskFlags(answers, questions);
  const elevatedClusters = analyseSymptomClusters(answers, questions, conditionLabel === 'depression' ? 'PHQ-9' : 'GAD-7');

  return {
    rawScore,
    weightedScore:  weightedTotal,
    normalisedScore,
    severity,
    confidence,
    interpretation: `${severity.charAt(0).toUpperCase() + severity.slice(1)} ${conditionLabel}`,
    recommendation: RECOMMENDATIONS[severity],
    riskFlags,
    elevatedClusters,
    aiNote: riskFlags.includes('suicidal_ideation')
      ? 'URGENT: Suicidal ideation detected. Immediate clinical intervention is strongly recommended.'
      : null
  };
}

// ─── Service Class ────────────────────────────────────────────────────────────

class AssessmentService {
  static calculatePHQ9Score(answers) {
    return runAIAssessment(answers, PHQ9_QUESTIONS, 'depression');
  }

  static calculateGAD7Score(answers) {
    return runAIAssessment(answers, GAD7_QUESTIONS, 'anxiety');
  }

  static detectComorbidity(phq9Result, gad7Result) {
    return detectComorbidity(phq9Result, gad7Result);
  }

  static validateAnswers(type, answers) {
    const expected = type === 'PHQ-9' ? 9 : 7;
    if (!Array.isArray(answers) || answers.length !== expected) {
      throw new Error(`Expected ${expected} answers for ${type}, got ${answers?.length ?? 0}`);
    }
    answers.forEach((a, i) => {
      if (typeof a.score !== 'number' || a.score < 0 || a.score > 3) {
        throw new Error(`Invalid score at question ${i + 1}. Must be 0–3`);
      }
    });
    return true;
  }

  static getQuestions(type) {
    if (type === 'PHQ-9') return PHQ9_QUESTIONS;
    if (type === 'GAD-7') return GAD7_QUESTIONS;
    throw new Error('Invalid assessment type');
  }

  static getFormattedQuestions(type) {
    return AssessmentService.getQuestions(type).map((q) => ({
      id:      q.id,
      question: q.text,
      options: ANSWER_OPTIONS
    }));
  }
}

module.exports = AssessmentService;
