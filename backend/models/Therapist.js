const mongoose = require('mongoose');

/**
 * therapists collection
 * Used by: TherapistRegisterPage (all 4 steps), TherapistProfilePage,
 *          FindTherapistPage (name, profileImage, specialization, bio,
 *          experienceYears, hourlyRate, availability, rating, reviewCount, workplace),
 *          TherapistCard (avatar→profileImage, verified, rating, reviews, experience),
 *          AvailabilityPage, AdminVerificationsPage (licenseNumber, authority, expiry,
 *          confidence, status, submitted), AI matching service
 */
const therapistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Step 1 — Professional Info
  specialization:  [{ type: String }],
  experienceYears: { type: Number, default: 0, min: 0 },
  bio:             { type: String, default: '', maxlength: 1000 },
  workplace:       { type: String, default: '' },
  hourlyRate:      { type: Number, default: 500, min: 0 },
  languages:       [{ type: String }],

  // Step 2 — Education
  education: {
    degreeType:      { type: String, enum: ['Bachelor', 'Master', 'Doctorate', 'Diploma'] },
    field:           { type: String, enum: ['Psychology', 'Clinical Psychology', 'Social Work', 'Counseling', 'Other'] },
    institution:     { type: String, default: '' },
    graduationYear:  { type: Number }
  },

  // Step 2 — Competency checkboxes
  competency: {
    hasCOC:      { type: Boolean, default: false },
    examPassed:  { type: Boolean, default: false }
  },

  // Step 3 — License
  license: {
    licenseNumber:    { type: String, required: true, unique: true },
    issuingAuthority: { type: String, enum: ['Ministry of Health', 'Regional Health Bureau', 'Other'] },
    issueDate:        { type: Date, default: null },
    licenseExpiryDate:{ type: Date },
    licenseDocument:  { type: String, default: null }   // filename or URL
  },

  // Verification — AdminVerificationsPage columns: status, confidence, submitted, notes
  verification: {
    status:     { type: String, enum: ['VERIFIED', 'PENDING', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
    notes:      { type: String, default: null },
    confidence: { type: Number, default: null },   // 0-100, shown in admin table
    verifiedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null }
  },

  // AvailabilityPage + AI matching
  availability: [{
    day:       { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
    startTime: { type: String },
    endTime:   { type: String }
  }],

  // Cached stats — updated when reviews/appointments change
  // FindTherapistPage uses: rating, reviewCount
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

therapistSchema.pre('save', function () { this.updatedAt = Date.now(); });

module.exports = mongoose.model('Therapist', therapistSchema);
