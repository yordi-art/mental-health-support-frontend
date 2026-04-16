const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Issue = require('../models/Issue');
const Assessment = require('../models/Assessment');

class AdminController {
  // Get admin dashboard stats
  static async getDashboard(req, res) {
    try {
      const [
        totalUsers,
        totalTherapists,
        totalClients,
        totalAppointments,
        totalPayments,
        totalRevenue,
        pendingVerifications,
        openIssues
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
        require('../models/Therapist').countDocuments({ 'verification.status': 'PENDING' }),
        Issue.countDocuments({ status: 'open' })
      ]);

      res.json({
        stats: {
          totalUsers,
          totalTherapists,
          totalClients,
          totalAppointments,
          totalPayments,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingVerifications,
          openIssues
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
    }
  }

  // Get all users
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;

      let query = {};
      if (role) {
        query.role = role;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get users', error: error.message });
    }
  }

  // Get all appointments
  static async getAppointments(req, res) {
    try {
      const { page = 1, limit = 10, status, date } = req.query;

      let query = {};
      if (status) {
        query.status = status;
      }
      if (date) {
        query.date = date;
      }

      const appointments = await Appointment.find(query)
        .populate('clientId', 'name email')
        .populate({
          path: 'therapistId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        })
        .sort({ date: -1, time: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Appointment.countDocuments(query);

      res.json({
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get appointments', error: error.message });
    }
  }

  // Get all payments
  static async getPayments(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      let query = {};
      if (status) {
        query.status = status;
      }

      const payments = await Payment.find(query)
        .populate('userId', 'name email')
        .populate('appointmentId')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(query);

      res.json({
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get payments', error: error.message });
    }
  }

  // Get all reviews
  static async getReviews(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const reviews = await Review.find()
        .populate('clientId', 'name email')
        .populate({
          path: 'therapistId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        })
        .populate('appointmentId', 'date sessionType')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments();

      res.json({
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
  }

  // Get all issues
  static async getIssues(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      let query = {};
      if (status) {
        query.status = status;
      }

      const issues = await Issue.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Issue.countDocuments(query);

      res.json({
        issues,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get issues', error: error.message });
    }
  }

  // Update user status
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'User status updated',
        user
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user status', error: error.message });
    }
  }

  // Get analytics data
  static async getAnalytics(req, res) {
    try {
      // Monthly appointment stats
      const monthlyAppointments = await Appointment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Revenue by payment method
      const revenueByMethod = await Payment.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Assessment statistics
      const assessmentStats = await Assessment.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgScore: { $avg: '$totalScore' }
          }
        }
      ]);

      res.json({
        monthlyAppointments,
        revenueByMethod,
        assessmentStats
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get analytics', error: error.message });
    }
  }
}

module.exports = AdminController;