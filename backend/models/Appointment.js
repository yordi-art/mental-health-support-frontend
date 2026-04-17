const mongoose = require('mongoose');

/**
 * appointments collection
 * Used by: AppointmentsPage, BookingPage, ClientDashboard
 *          (therapistId.userId.name→therapistName, date, time, status),
 *          TherapistAppointmentsPage, AdminAppointmentsPage,
 *          VideoSessionPage (meetingLink), SessionHistoryPage
 *
 * NOTE: therapistId references the Therapist document (_id),
 *       NOT the User._id — consistent with how Therapist model is queried.
 */
const appointmentSchema = new mongoose.Schema({
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },

  date:        { type: Date,   required: true },
  time:        { type: String, required: true },   // "14:00"
  duration:    { type: Number, default: 60 },      // minutes
  sessionType: { type: String, enum: ['video', 'chat', 'in-person'], default: 'video' },

  status:        { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },

  notes:        { type: String, default: null },
  meetingLink:  { type: String, default: null },   // VideoSessionPage
  cancelReason: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

appointmentSchema.pre('save', function () { this.updatedAt = Date.now(); });
appointmentSchema.index({ clientId: 1, date: 1 });
appointmentSchema.index({ therapistId: 1, date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
