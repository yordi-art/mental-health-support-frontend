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

module.exports = router;