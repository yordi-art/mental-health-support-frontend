const express = require('express');
const AdminController = require('../controllers/adminController');
const PaymentController = require('../controllers/paymentController');
const AssessmentController = require('../controllers/assessmentController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(roleAuth(['admin']));

// Dashboard
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics', AdminController.getAnalytics);

// Users
router.get('/users', AdminController.getUsers);
router.put('/users/:id/status', AdminController.updateUserStatus);

// Appointments
router.get('/appointments', AdminController.getAppointments);

// Payments
router.get('/payments', AdminController.getPayments);
router.put('/payments/:id/status', PaymentController.updatePaymentStatus);

// Reviews
router.get('/reviews', AdminController.getReviews);

// Assessments
router.get('/assessments', AssessmentController.getAllAssessments);

// Issues
router.get('/issues', AdminController.getIssues);

// Verifications
router.get('/verifications', async (req, res) => {
  try {
    const Therapist = require('../models/Therapist');
    const verifications = await Therapist.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const result = verifications.map(t => ({
      _id: t._id,
      name: t.userId?.name || 'Unknown',
      email: t.userId?.email || '',
      profession: t.specialization?.[0] || 'Therapist',
      status: t.verification?.status || 'PENDING',
      notes: t.verification?.notes || '',
      confidence: null,
      submitted: t.createdAt,
      licenseNumber: t.license?.licenseNumber || '',
      authority: t.license?.issuingAuthority || '',
      expiry: t.license?.licenseExpiryDate || null,
    }));

    res.json({ verifications: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get verifications', error: error.message });
  }
});

// Flag / suspend / reupload actions
router.put('/verifications/:id/flag', async (req, res) => {
  try {
    const Therapist = require('../models/Therapist');
    const { reason } = req.body;
    const t = await Therapist.findByIdAndUpdate(req.params.id,
      { 'verification.status': 'REJECTED', 'verification.notes': reason || 'Flagged by admin' },
      { new: true });
    res.json({ message: 'Flagged', verification: t?.verification });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/verifications/:id/suspend', async (req, res) => {
  try {
    const Therapist = require('../models/Therapist');
    const t = await Therapist.findById(req.params.id);
    if (t) { await User.findByIdAndUpdate(t.userId, { isActive: false }); }
    res.json({ message: 'Suspended' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/verifications/:id/reupload', async (req, res) => {
  try {
    const Therapist = require('../models/Therapist');
    const t = await Therapist.findByIdAndUpdate(req.params.id,
      { 'verification.status': 'PENDING', 'verification.notes': 'Admin requested re-upload' },
      { new: true });
    res.json({ message: 'Re-upload requested', verification: t?.verification });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;