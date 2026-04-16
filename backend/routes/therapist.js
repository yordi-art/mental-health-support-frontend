const express = require('express');
const TherapistController = require('../controllers/therapistController');
const AppointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const verifiedTherapistOnly = require('../middleware/verifiedTherapistOnly');

const router = express.Router();

/**
 * Public Routes
 * Therapist Registration
 */

// Register therapist (public)
router.post('/register', TherapistController.registerTherapist);

/**
 * Protected Routes
 * Require authentication and therapist role
 */

// Apply auth middleware to protected routes
router.use(auth);
router.use(roleAuth(['therapist']));

// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [
      todayAppointments,
      totalAppointments,
      totalEarnings,
      averageRating,
      verificationStatus
    ] = await Promise.all([
      require('../models/Appointment').find({
        therapistId: req.user._id,
        date: new Date().toISOString().split('T')[0],
        status: { $in: ['pending', 'confirmed'] }
      })
      .populate('clientId', 'name email phone'),

      require('../models/Appointment').countDocuments({
        therapistId: req.user._id,
        status: 'completed'
      }),

      require('../models/Payment').aggregate([
        { $match: { status: 'paid' } },
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment'
          }
        },
        { $unwind: '$appointment' },
        { $match: { 'appointment.therapistId': req.user._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      require('../models/Review').aggregate([
        { $match: { therapistId: req.user._id } },
        { $group: { _id: null, average: { $avg: '$rating' } } }
      ]),

      require('../models/Therapist').findOne({ userId: req.user._id }, 'verification')
    ]);

    res.json({
      todayAppointments,
      stats: {
        totalAppointments,
        totalEarnings: totalEarnings[0]?.total || 0,
        averageRating: averageRating[0]?.average ? Math.round(averageRating[0].average * 10) / 10 : 0,
        verificationStatus: verificationStatus?.verification?.status || 'PENDING'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get dashboard data', error: error.message });
  }
});

// Profile
router.get('/profile', TherapistController.getProfile);
router.put('/profile', TherapistController.updateProfile);

// Verification
router.get('/verification-status', TherapistController.getVerificationStatus);
router.post('/reupload-license', TherapistController.reuploadLicense);

// Appointments (VERIFIED only)
router.get('/appointments', verifiedTherapistOnly, TherapistController.getAppointments);
router.put('/appointments/:id/status', verifiedTherapistOnly, AppointmentController.updateAppointmentStatus);

// Availability (VERIFIED only)
router.put('/availability', verifiedTherapistOnly, TherapistController.updateAvailability);

// Reviews
router.get('/reviews', TherapistController.getReviews);

module.exports = router;