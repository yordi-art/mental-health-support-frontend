const Assessment = require('../models/Assessment');
const AssessmentService = require('../services/assessmentService');

class AssessmentController {
  // Submit assessment
  static async submitAssessment(req, res) {
    try {
      const { type, answers } = req.body;

      // Validate assessment type
      if (!['PHQ-9', 'GAD-7'].includes(type)) {
        return res.status(400).json({ message: 'Invalid assessment type' });
      }

      // Validate answers
      AssessmentService.validateAnswers(type, answers);

      // Calculate score
      let result;
      if (type === 'PHQ-9') {
        result = AssessmentService.calculatePHQ9Score(answers);
      } else {
        result = AssessmentService.calculateGAD7Score(answers);
      }

      // Save assessment
      const assessment = new Assessment({
        userId: req.user._id,
        type,
        answers,
        totalScore: result.totalScore,
        resultCategory: result.category,
        interpretation: result.interpretation
      });

      await assessment.save();

      res.status(201).json({
        message: 'Assessment submitted successfully',
        assessment: {
          id: assessment._id,
          type: assessment.type,
          score: assessment.totalScore,
          category: assessment.resultCategory,
          interpretation: assessment.interpretation,
          createdAt: assessment.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit assessment', error: error.message });
    }
  }

  // Get user's assessment results
  static async getAssessmentResults(req, res) {
    try {
      const assessments = await Assessment.find({ userId: req.user._id })
        .sort({ createdAt: -1 });

      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get assessment results', error: error.message });
    }
  }

  // Get assessment questions
  static async getQuestions(req, res) {
    try {
      const { type } = req.params;

      if (!['PHQ-9', 'GAD-7'].includes(type)) {
        return res.status(400).json({ message: 'Invalid assessment type' });
      }

      const questions = AssessmentService.getQuestions(type);

      res.json({
        type,
        questions: questions.map((question, index) => ({
          id: index + 1,
          question,
          options: [
            { value: 0, label: 'Not at all' },
            { value: 1, label: 'Several days' },
            { value: 2, label: 'More than half the days' },
            { value: 3, label: 'Nearly every day' }
          ]
        }))
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get questions', error: error.message });
    }
  }

  // Get latest assessment
  static async getLatestAssessment(req, res) {
    try {
      const assessment = await Assessment.findOne({ userId: req.user._id })
        .sort({ createdAt: -1 });

      if (!assessment) {
        return res.status(404).json({ message: 'No assessments found' });
      }

      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get latest assessment', error: error.message });
    }
  }

  // Admin: Get all assessments
  static async getAllAssessments(req, res) {
    try {
      const { page = 1, limit = 10, type } = req.query;

      let query = {};
      if (type) {
        query.type = type;
      }

      const assessments = await Assessment.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Assessment.countDocuments(query);

      res.json({
        assessments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get assessments', error: error.message });
    }
  }
}

module.exports = AssessmentController;