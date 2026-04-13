const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    required: true
  }],
  experienceYears: {
    type: Number,
    required: true,
    min: 0
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000
  },
  workplace: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'flagged', 'expired'],
    default: 'pending'
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  issuingAuthority: {
    type: String,
    required: true
  },
  licenseExpiryDate: {
    type: Date,
    required: true
  },
  licenseDocument: {
    type: String // URL to uploaded document
  },
  verificationResult: {
    type: String
  },
  hourlyRate: {
    type: Number,
    default: 50
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  languages: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Therapist', therapistSchema);