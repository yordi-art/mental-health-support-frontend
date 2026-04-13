const Therapist = require('../models/Therapist');
const User = require('../models/User');
const TherapistVerificationService = require('../services/therapistVerificationService');

/**
 * Therapist Controller
 * 
 * This system performs preliminary digital verification and does not replace 
 * official licensing by the Ministry of Health or regulatory authorities in Ethiopia.
 */

class TherapistController {
  /**
   * Register therapist
   * POST /api/therapist/register
   * Sets initial status to PENDING and runs automatic verification
   */
  static async registerTherapist(req, res) {
    try {
      const { name, email, password, phone, gender, dateOfBirth } = req.body;
      const therapistData = req.body.therapistData;

      // Validate therapist data is provided
      if (!therapistData) {
        return res.status(400).json({
          message: 'Therapist data is required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already registered'
        });
      }

      // Create user account
      const user = new User({
        name,
        email,
        password,
        phone,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        role: 'therapist'
      });

      await user.save();

      // Register therapist with automatic verification
      const therapist = await TherapistVerificationService.registerTherapist(
        user._id,
        therapistData
      );

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Therapist registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        verification: {
          status: therapist.verification.status,
          notes: therapist.verification.notes
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to register therapist',
        error: error.message
      });
    }
  }

  /**
   * Get verification status
   * GET /api/therapist/verification-status
   */
  static async getVerificationStatus(req, res) {
    try {
      const therapist = await Therapist.findOne({ userId: req.user._id });

      if (!therapist) {
        return res.status(404).json({
          message: 'Therapist profile not found'
        });
      }

      const details = TherapistVerificationService.getVerificationDetails(therapist);

      res.json({
        message: 'Verification status retrieved',
        verification: details
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get verification status',
        error: error.message
      });
    }
  }

  /**
   * Re-upload license and re-verify
   * POST /api/therapist/reupload-license
   */
  static async reuploadLicense(req, res) {
    try {
      const { licenseNumber, issuingAuthority, licenseExpiryDate, licenseDocument } = req.body;

      // Validate required fields
      if (!licenseNumber || !issuingAuthority || !licenseExpiryDate || !licenseDocument) {
        return res.status(400).json({
          message: 'All license fields are required'
        });
      }

      const therapist = await TherapistVerificationService.reuploadLicense(
        req.user._id,
        {
          licenseNumber,
          issuingAuthority,
          licenseExpiryDate: new Date(licenseExpiryDate),
          licenseDocument
        }
      );

      const details = TherapistVerificationService.getVerificationDetails(therapist);

      res.json({
        message: 'License re-uploaded and re-verification completed',
        verification: details
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to re-upload license',
        error: error.message
      });
    }
  }

  /**
   * Get therapist profile
   * GET /api/therapist/profile
   */
  static async getProfile(req, res) {
    try {
      const therapist = await Therapist.findOne({ userId: req.user._id })
        .populate('userId', 'name email phone profileImage');

      if (!therapist) {
        return res.status(404).json({
          message: 'Therapist profile not found'
        });
      }

      res.json({
        therapist,
        isEligible: TherapistVerificationService.isEligibleForService(therapist)
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get profile',
        error: error.message
      });
    }
  }

  /**
   * Update therapist profile
   * PUT /api/therapist/profile
   */
  static async updateProfile(req, res) {
    try {
      const updates = req.body;
      const allowedUpdates = [
        'specialization', 'experienceYears', 'bio', 'workplace',
        'hourlyRate', 'availability', 'languages'
      ];

      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const therapist = await Therapist.findOneAndUpdate(
        { userId: req.user._id },
        filteredUpdates,
        { new: true }
      );

      if (!therapist) {
        return res.status(404).json({
          message: 'Therapist profile not found'
        });
      }

      res.json({
        message: 'Profile updated successfully',
        therapist
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  /**
   * Get appointments
   * GET /api/therapist/appointments
   */
  static async getAppointments(req, res) {
    try {
      const Appointment = require('../models/Appointment');

      const appointments = await Appointment.find({ therapistId: req.user._id })
        .populate('clientId', 'name email phone')
        .sort({ date: -1, time: -1 });

      res.json(appointments);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get appointments',
        error: error.message
      });
    }
  }

  /**
   * Update availability
   * PUT /api/therapist/availability
   */
  static async updateAvailability(req, res) {
    try {
      const { availability } = req.body;

      const therapist = await Therapist.findOneAndUpdate(
        { userId: req.user._id },
        { availability },
        { new: true }
      );

      if (!therapist) {
        return res.status(404).json({
          message: 'Therapist profile not found'
        });
      }

      res.json({
        message: 'Availability updated successfully',
        availability: therapist.availability
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update availability',
        error: error.message
      });
    }
  }

  /**
   * Get therapist reviews
   * GET /api/therapist/reviews
   */
  static async getReviews(req, res) {
    try {
      const Review = require('../models/Review');

      const reviews = await Review.find({ therapistId: req.user._id })
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
      res.status(500).json({
        message: 'Failed to get reviews',
        error: error.message
      });
    }
  }
}

module.exports = TherapistController;