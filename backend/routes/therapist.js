const express = require('express');
const TherapistController = require('../controllers/therapistController');
const AppointmentController = require('../controllers/appointmentController');
const ReviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Apply auth middleware to all routes
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

      require('../models/Therapist').findOne({ userId: req.user._id }, 'verificationStatus')
    ]);

    res.json({
      todayAppointments,
      stats: {
        totalAppointments,
        totalEarnings: totalEarnings[0]?.total || 0,
        averageRating: averageRating[0]?.average ? Math.round(averageRating[0].average * 10) / 10 : 0,
        verificationStatus: verificationStatus?.verificationStatus || 'unknown'
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

// Appointments
router.get('/appointments', TherapistController.getAppointments);
router.put('/appointments/:id/status', AppointmentController.updateAppointmentStatus);

// Availability
router.put('/availability', TherapistController.updateAvailability);

// Reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await require('../models/Review').find({ therapistId: req.user._id })
      .populate('clientId', 'name')
      .populate('appointmentId', 'date sessionType')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get reviews', error: error.message });
  }
});

module.exports = router;