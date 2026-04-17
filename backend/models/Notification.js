const mongoose = require('mongoose');

/**
 * notifications collection
 * Used by: NotificationsPage, NotificationBell (unread count),
 *          ClientDashboard (notifications list: message, isRead, createdAt),
 *          socket.io real-time delivery
 */
const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title:   { type: String, default: '' },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'appointment_reminder', 'appointment_confirmed', 'appointment_cancelled',
      'payment_success', 'payment_failed', 'verification_status',
      'new_message', 'system'
    ],
    required: true
  },

  isRead: { type: Boolean, default: false },

  // Reference to related document (appointment, payment, etc.)
  relatedId:    { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedModel: { type: String, enum: ['Appointment', 'Payment', 'Therapist', null], default: null },

  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
