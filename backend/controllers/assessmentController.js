/**
 * Assessment Controller
 * Sends assessment answers to the Python AI microservice.
 * The Python service fetches therapists directly from MongoDB —
 * this controller does NOT fetch or pass therapist data.
 * This system uses machine learning to support decision-making
 * and does not replace professional medical diagnosis.
 */

const Assessment        = require('../models/Assessment');
const AssessmentService = require('../services/assessmentService');  // JS fallback
const { callAI }        = require('../services/aiService');

class AssessmentController {

  // GET /assessment/questions/:type
  static async getQuestions(req, res) {
    try {
      const { type } = req.params;
      if (!['PHQ-9', 'GAD-7'].includes(type)) {
        return res.status(400).json({ message: 'Invalid assessment type. Use PHQ-9 or GAD-7' });
      }
      res.json({ type, questions: AssessmentService.getFormattedQuestions(type) });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get questions', error: error.message });
    }
  }

  /**
   * POST /assessment
   * Sends answers to Python AI service.
   * Python fetches therapists from MongoDB, runs ML assessment + KNN matching.
   * Node.js only persists the result and returns the response.
   */
  static async submitAssessment(req, res) {
    try {
      const { type, answers } = req.body;

      if (!['PHQ-9', 'GAD-7'].includes(type)) {
        return res.status(400).json({ message: 'Invalid assessment type. Use PHQ-9 or GAD-7' });
      }

      AssessmentService.validateAnswers(type, answers);

      // Check for previous opposite-type assessment (for comorbidity detection)
      const oppositeType = type === 'PHQ-9' ? 'GAD-7' : 'PHQ-9';
      const prevOpposite = await Assessment.findOne({
        userId: req.user._id,
        type:   oppositeType,
      }).sort({ createdAt: -1 });

      const previousAssessment = prevOpposite
        ? { type: oppositeType, severity: prevOpposite.resultCategory }
        : null;

      // Call Python AI service — it fetches therapists from DB itself
      let aiResult;
      try {
        aiResult = await callAI('/ai/assess-and-match', {
          type,
          answers,
          previousAssessment,
        });
      } catch (aiErr) {
        // Fallback to JS engine if Python service is unavailable
        console.warn('[AI] Python service unavailable, using JS fallback:', aiErr.message);
        const jsResult = type === 'PHQ-9'
          ? AssessmentService.calculatePHQ9Score(answers)
          : AssessmentService.calculateGAD7Score(answers);
        aiResult = {
          disclaimer:            'Rule-based fallback (Python AI service unavailable)',
          assessment:            { ...jsResult, probabilityDist: null, elevatedDomains: {}, keyQuestions: [] },
          comorbidity:           null,
          recommendedTherapists: [],
        };
      }

      const { assessment: ai, comorbidity, recommendedTherapists } = aiResult;

      // Persist to MongoDB
      const saved = await Assessment.create({
        userId:         req.user._id,
        type,
        answers,
        totalScore:     ai.rawScore,
        resultCategory: ai.severity,
        interpretation: ai.interpretation,
      });

      res.status(201).json({
        message:    'Assessment completed successfully',
        disclaimer: aiResult.disclaimer,
        assessment: {
          id:              saved._id,
          type:            saved.type,
          rawScore:        ai.rawScore,
          severity:        ai.severity,
          confidence:      ai.confidence,
          probabilityDist: ai.probabilityDist,
          interpretation:  ai.interpretation,
          recommendation:  ai.recommendation,
          riskFlags:       ai.riskFlags,
          elevatedDomains: ai.elevatedDomains,
          keyQuestions:    ai.keyQuestions,
          aiNote:          ai.aiNote,
          comorbidity,
          createdAt:       saved.createdAt,
        },
        recommendedTherapists,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit assessment', error: error.message });
    }
  }

  // GET /assessment/results
  static async getAssessmentResults(req, res) {
    try {
      const assessments = await Assessment.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get assessment results', error: error.message });
    }
  }

  // GET /assessment/latest
  static async getLatestAssessment(req, res) {
    try {
      const assessment = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (!assessment) return res.status(404).json({ message: 'No assessments found' });
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get latest assessment', error: error.message });
    }
  }

  /**
   * GET /assessment/recommendations
   * Re-runs KNN matching based on latest saved assessment.
   * Python fetches therapists from MongoDB directly.
   */
  static async getRecommendations(req, res) {
    try {
      const latest = await Assessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (!latest) {
        return res.status(404).json({ message: 'No assessment found. Please complete an assessment first.' });
      }

      let result;
      try {
        result = await callAI('/ai/match', {
          severity: latest.resultCategory,
        });
      } catch (aiErr) {
        console.warn('[AI] Python service unavailable for recommendations:', aiErr.message);
        return res.status(503).json({ message: 'AI service temporarily unavailable. Please try again.' });
      }

      res.json({
        basedOn:               { type: latest.type, severity: latest.resultCategory, score: latest.totalScore },
        disclaimer:            result.disclaimer,
        recommendedTherapists: result.recommendedTherapists,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
    }
  }

  // Admin: GET /assessment/all
  static async getAllAssessments(req, res) {
    try {
      const { page = 1, limit = 10, type } = req.query;
      const query = type ? { type } : {};
      const [assessments, total] = await Promise.all([
        Assessment.find(query)
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .limit(Number(limit))
          .skip((page - 1) * limit),
        Assessment.countDocuments(query),
      ]);
      res.json({
        assessments,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get assessments', error: error.message });
    }
  }
}

module.exports = AssessmentController;
