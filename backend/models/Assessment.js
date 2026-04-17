const mongoose = require('mongoose');

/**
 * assessments collection
 * Used by: AssessmentPage, AssessmentResultPage,
 *          ClientDashboard (type, totalScore→score, resultCategory→category,
 *          recommendation, createdAt→date), AI engine output fields
 */
const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type:    { type: String, enum: ['PHQ-9', 'GAD-7'], required: true },
  answers: [{ question: String, score: { type: Number, min: 0, max: 3 } }],

  // Core scoring — ClientDashboard reads totalScore as "score"
  totalScore:     { type: Number, required: true },
  weightedScore:  { type: Number, default: null },
  resultCategory: { type: String, enum: ['minimal', 'mild', 'moderate', 'severe'], required: true },

  // AI output
  confidence:      { type: Number, default: null },
  probabilityDist: { type: mongoose.Schema.Types.Mixed, default: null },
  interpretation:  { type: String, default: '' },
  recommendation:  { type: String, default: '' },
  riskFlags:       [{ type: String }],
  elevatedDomains: { type: mongoose.Schema.Types.Mixed, default: null },
  keyQuestions:    [{ type: Number }],
  aiNote:          { type: String, default: null },

  // Comorbidity
  comorbidity: {
    detected:         { type: Boolean, default: false },
    combinedSeverity: { type: String, default: null },
    note:             { type: String, default: null }
  },

  createdAt: { type: Date, default: Date.now }
});

assessmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
