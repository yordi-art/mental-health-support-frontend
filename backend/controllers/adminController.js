const User        = require('../models/User');
const Therapist   = require('../models/Therapist');
const Appointment = require('../models/Appointment');
const Payment     = require('../models/Payment');
const Review      = require('../models/Review');
const Issue       = require('../models/Issue');
const Assessment  = require('../models/Assessment');

class AdminController {

  // GET /admin/dashboard
  // AdminDashboard reads: totalUsers, totalTherapists, totalAppointments,
  //   totalRevenue, flaggedVerifications, pendingIssues, recentUsers[]
  static async getDashboard(req, res) {
    try {
      const [
        totalUsers,
        totalTherapists,
        totalClients,
        totalAppointments,
        totalPayments,
        totalRevenueAgg,
        flaggedVerifications,
        pendingIssues,
        recentUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'therapist' }),
        User.countDocuments({ role: 'client' }),
        Appointment.countDocuments(),
        Payment.countDocuments({ status: 'paid' }),
        Payment.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        // flaggedVerifications = PENDING + REJECTED verifications
        Therapist.countDocuments({ 'verification.status': { $in: ['PENDING', 'REJECTED'] } }),
        Issue.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
        User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt')
      ]);

      res.json({
        stats: {
          totalUsers,
          totalTherapists,
          totalClients,
          totalAppointments,
          totalPayments,
          totalRevenue:        totalRevenueAgg[0]?.total || 0,
          flaggedVerifications,
          pendingIssues,
          recentUsers
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
    }
  }

  // GET /admin/users
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const query = {};
      if (role)   query.role = role;
      if (search) query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];

      const [users, total] = await Promise.all([
        User.find(query).select('-password').sort({ createdAt: -1 })
          .limit(Number(limit)).skip((page - 1) * limit),
        User.countDocuments(query)
      ]);

      res.json({ users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get users', error: error.message });
    }
  }

  // PUT /admin/users/:id/status
  static async updateUserStatus(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id, { isActive: req.body.isActive }, { new: true }
      ).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User status updated', user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user status', error: error.message });
    }
  }

  // GET /admin/appointments
  static async getAppointments(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const query = status ? { status } : {};

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('clientId', 'name email')
          .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email' } })
          .sort({ date: -1 })
          .limit(Number(limit)).skip((page - 1) * limit),
        Appointment.countDocuments(query)
      ]);

      res.json({ appointments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get appointments', error: error.message });
    }
  }

  // GET /admin/payments
  static async getPayments(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const query = status ? { status } : {};

      const [payments, total] = await Promise.all([
        Payment.find(query)
          .populate('userId', 'name email')
          .populate('appointmentId')
          .sort({ createdAt: -1 })
          .limit(Number(limit)).skip((page - 1) * limit),
        Payment.countDocuments(query)
      ]);

      res.json({ payments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get payments', error: error.message });
    }
  }

  // GET /admin/reviews
  static async getReviews(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const [reviews, total] = await Promise.all([
        Review.find()
          .populate('clientId', 'name email')
          .populate('therapistId', 'name email')
          .populate('appointmentId', 'date sessionType')
          .sort({ createdAt: -1 })
          .limit(Number(limit)).skip((page - 1) * limit),
        Review.countDocuments()
      ]);

      res.json({ reviews, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
  }

  // GET /admin/issues  (AdminReportsPage)
  static async getIssues(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const query = status ? { status } : {};

      const [issues, total] = await Promise.all([
        Issue.find(query)
          .populate('userId', 'name email')
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 })
          .limit(Number(limit)).skip((page - 1) * limit),
        Issue.countDocuments(query)
      ]);

      res.json({ issues, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get issues', error: error.message });
    }
  }

  // GET /admin/analytics
  static async getAnalytics(req, res) {
    try {
      const [monthlyAppointments, revenueByMethod, assessmentStats, severityDist] = await Promise.all([
        Appointment.aggregate([
          { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        Payment.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]),
        Assessment.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 }, avgScore: { $avg: '$totalScore' } } }
        ]),
        Assessment.aggregate([
          { $group: { _id: '$resultCategory', count: { $sum: 1 } } }
        ])
      ]);

      res.json({ monthlyAppointments, revenueByMethod, assessmentStats, severityDist });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get analytics', error: error.message });
    }
  }
}

module.exports = AdminController;
