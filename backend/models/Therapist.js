const mongoose = require('mongoose');

/**
 * Therapist Model
 * 
 * This system performs preliminary digital verification and does not replace 
 * official licensing by the Ministry of Health or regulatory authorities in Ethiopia.
 */

const therapistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Professional Information
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

  // Education Details
  education: {
    degreeType: {
      type: String,
      enum: ['Bachelor', 'Master', 'Doctorate', 'Diploma'],
      required: true
    },
    field: {
      type: String,
      enum: ['Psychology', 'Clinical Psychology', 'Social Work', 'Counseling', 'Other'],
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    graduationYear: {
      type: Number,
      required: true
    }
  },

  // License Information
  license: {
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    issuingAuthority: {
      type: String,
      enum: ['Ministry of Health', 'Regional Bureau of Health', 'Other'],
      required: true
    },
    licenseExpiryDate: {
      type: Date,
      required: true
    },
    licenseDocument: {
      type: String // URL to uploaded document
    }
  },

  // Competency Information
  competency: {
    hasCOC: {
      type: Boolean,
      default: false
    },
    examPassed: {
      type: Boolean,
      default: false
    }
  },

  // Verification Status
  verification: {
    status: {
      type: String,
      enum: ['VERIFIED', 'PENDING', 'REJECTED', 'EXPIRED'],
      default: 'PENDING'
    },
    notes: {
      type: String
    },
    verifiedAt: {
      type: Date
    }
  },

  // Additional Fields
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
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
therapistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Therapist', therapistSchema);