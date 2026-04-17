const mongoose = require('mongoose');

/**
 * reviews collection
 * Used by: ReviewPage, TherapistReviewsPage, AdminReviewsPage,
 *          FindTherapistPage (rating, reviewCount cached on Therapist),
 *          AI matching service (avg rating per therapist)
 *
 * therapistId = User._id of the therapist (used by AI matching which
 * queries Review.find({ therapistId: therapist.userId._id }))
 */
const reviewSchema = new mongoose.Schema({
  clientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
  therapistId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },

  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },

  // AdminReviewsPage moderation
  isVisible: { type: Boolean, default: true },
  flagged:   { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

reviewSchema.index({ appointmentId: 1 }, { unique: true });
reviewSchema.index({ therapistId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
