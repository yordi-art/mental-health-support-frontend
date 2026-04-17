const mongoose = require('mongoose');

/**
 * issues collection
 * Used by: AdminReportsPage (type, subject, description, status, priority,
 *          userId.name, createdAt), ContactPage form submission
 */
const issueSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['technical_issue', 'payment_issue', 'appointment_issue', 'therapist_concern', 'general_feedback'],
    required: true
  },
  subject:     { type: String, maxlength: 200, default: '' },
  description: { type: String, required: true, maxlength: 1000 },

  status:   { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },

  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolution:  { type: String, default: null },
  resolvedAt:  { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

issueSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
issueSchema.index({ status: 1, priority: 1 });
issueSchema.index({ userId: 1 });

module.exports = mongoose.model('Issue', issueSchema);
