const express = require('express');
const AppointmentController = require('../controllers/appointmentController');
const PaymentController = require('../controllers/paymentController');
const AssessmentController = require('../controllers/assessmentController');
const ReviewController = require('../controllers/reviewController');
const Therapist = require('../models/Therapist');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(roleAuth(['client']));

// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [
      upcomingAppointments,
      recentAssessments,
      recentPayments
    ] = await Promise.all([
      require('../models/Appointment').find({
        clientId: req.user._id,
        date: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] }
      })
      .populate({
        path: 'therapistId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ date: 1 })
      .limit(5),

      require('../models/Assessment').find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3),

      require('../models/Payment').find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
    ]);

    res.json({
      upcomingAppointments,
      recentAssessments,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get dashboard data', error: error.message });
  }
});

// Therapists
router.get('/therapists', async (req, res) => {
  try {
    const { specialization, location, page = 1, limit = 10 } = req.query;

    let query = { 'verification.status': 'VERIFIED' };

    if (specialization) {
      query.specialization = { $in: [specialization] };
    }

    const therapists = await Therapist.find(query)
      .populate('userId', 'name email phone profileImage')
      .select('specialization experienceYears bio workplace hourlyRate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Therapist.countDocuments(query);

    res.json({
      therapists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get therapists', error: error.message });
  }
});

// Appointments
router.get('/appointments', AppointmentController.getAppointments);
router.post('/appointments', AppointmentController.createAppointment);
router.put('/appointments/:id/status', AppointmentController.updateAppointmentStatus);
router.delete('/appointments/:id', AppointmentController.cancelAppointment);

// Payments
router.get('/payments', PaymentController.getPayments);
router.post('/payments', PaymentController.createPayment);
router.get('/payments/:id', PaymentController.getPaymentById);

// Assessments
router.post('/assessment', AssessmentController.submitAssessment);
router.get('/assessment/results', AssessmentController.getAssessmentResults);
router.get('/assessment/questions/:type', AssessmentController.getQuestions);

// Get detailed therapist profile (with verified credentials)
router.get('/therapists/:therapistId', async (req, res) => {
  try {
    const therapist = await Therapist.findOne({
      _id: req.params.therapistId,
      'verification.status': 'VERIFIED'
    }).populate('userId', 'name email phone profileImage');

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found or not verified' });
    }

    // Prepare verified therapist profile
    const verifiedProfile = {
      id: therapist._id,
      name: therapist.userId.name,
      email: therapist.userId.email,
      phone: therapist.userId.phone,
      profileImage: therapist.userId.profileImage,
      
      // Professional Information (Verified)
      specialization: therapist.specialization,
      experienceYears: therapist.experienceYears,
      bio: therapist.bio,
      workplace: therapist.workplace,
      hourlyRate: therapist.hourlyRate,
      languages: therapist.languages,
      
      // Education (Verified Credential)
      education: {
        field: therapist.education.field,           // Psychology, Clinical Psychology, Social Work
        degreeType: therapist.education.degreeType, // Master, Bachelor, etc.
        institution: therapist.education.institution,
        graduationYear: therapist.education.graduationYear
      },
      
      // License (Verified Credential)
      license: {
        licenseNumber: therapist.license.licenseNumber,
        issuingAuthority: therapist.license.issuingAuthority,
        licenseExpiryDate: therapist.license.licenseExpiryDate
      },
      
      // Competency (Verified)
      competency: {
        hasCOC: therapist.competency.hasCOC,
        examPassed: therapist.competency.examPassed
      },
      
      // Verification Badge
      verification: {
        status: therapist.verification.status,  // VERIFIED
        verifiedAt: therapist.verification.verifiedAt
      },
      
      availability: therapist.availability
    };

    // Get reviews and ratings
    const Review = require('../models/Review');
    const reviews = await Review.find({ therapistId: therapist._id })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalReviews = await Review.countDocuments({ therapistId: therapist._id });
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    res.json({
      therapist: verifiedProfile,
      reviews: {
        total: totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        recentReviews: reviews.map(r => ({
          clientName: r.clientId.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get therapist profile', error: error.message });
  }
});

// Reviews
router.get('/reviews', ReviewController.getUserReviews);
router.post('/reviews', ReviewController.createReview);
router.put('/reviews/:id', ReviewController.updateReview);
router.delete('/reviews/:id', ReviewController.deleteReview);

module.exports = router;