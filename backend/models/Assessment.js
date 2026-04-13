const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PHQ-9', 'GAD-7'],
    required: true
  },
  answers: [{
    question: String,
    answer: Number, // 0-3 for PHQ-9/GAD-7
    score: Number
  }],
  totalScore: {
    type: Number,
    required: true
  },
  resultCategory: {
    type: String,
    enum: ['minimal', 'mild', 'moderate', 'moderately-severe', 'severe'],
    required: true
  },
  interpretation: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);