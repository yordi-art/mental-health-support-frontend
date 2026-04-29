const Therapist = require('../models/Therapist');
const User = require('../models/User');
const TherapistVerificationService = require('../services/therapistVerificationService');

class TherapistController {

  /**
   * POST /api/therapist/register
   * Accepts multipart/form-data with therapistData JSON + licenseDocument file
   */
  static async registerTherapist(req, res) {
    try {
      const { name, email, password, phone, gender, dateOfBirth } = req.body;

      // therapistData may come as JSON string (multipart) or parsed object (JSON)
      let therapistData = req.body.therapistData;
      if (typeof therapistData === 'string') {
        try { therapistData = JSON.parse(therapistData); } catch {
          return res.status(400).json({ message: 'Invalid therapistData format' });
        }
      }

      if (!therapistData) {
        return res.status(400).json({ message: 'Therapist data is required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const user = new User({ name, email, password, phone, gender, dateOfBirth: new Date(dateOfBirth), role: 'therapist' });
      await user.save();

      // Pass file buffer if uploaded
      const fileBuffer = req.file?.buffer || null;
      const fileMimetype = req.file?.mimetype || null;

      // If file uploaded, store filename in license data
      if (req.file) {
        therapistData.license.licenseDocument = req.file.originalname;
      }

      const { therapist, aiDetails } = await TherapistVerificationService.registerTherapist(
        user._id, therapistData, fileBuffer, fileMimetype, req.file?.originalname || null
      );

      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'Therapist registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        verification: {
          status: therapist.verification.status,
          notes: therapist.verification.notes,
          aiDetails,
        },
      });
    } catch (error) {
      console.error('[registerTherapist]', error);
      res.status(500).json({ message: 'Failed to register therapist', error: error.message });
    }
  }

  /**
   * POST /api/therapist/reupload-license
   * Accepts multipart/form-data
   */
  static async reuploadLicense(req, res) {
    try {
      const { licenseNumber, issuingAuthority, licenseExpiryDate } = req.body;

      if (!licenseNumber || !issuingAuthority || !licenseExpiryDate) {
        return res.status(400).json({ message: 'licenseNumber, issuingAuthority, and licenseExpiryDate are required' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'License document file is required' });
      }

      const licenseData = {
        licenseNumber,
        issuingAuthority,
        licenseExpiryDate: new Date(licenseExpiryDate),
        licenseDocument: req.file.originalname,
      };

      const { therapist, aiDetails } = await TherapistVerificationService.reuploadLicense(
        req.user._id, licenseData, req.file.buffer, req.file.mimetype, req.file.originalname
      );

      const details = TherapistVerificationService.getVerificationDetails(therapist);

      res.json({
        message: 'License re-uploaded and re-verification completed',
        verification: { ...details, aiDetails },
      });
    } catch (error) {
      console.error('[reuploadLicense]', error);
      res.status(500).json({ message: 'Failed to re-upload license', error: error.message });
    }
  }

  /**
   * GET /api/therapist/verification-status
   */
  static async getVerificationStatus(req, res) {
    try {
      const therapist = await Therapist.findOne({ userId: req.user._id });
      if (!therapist) return res.status(404).json({ message: 'Therapist profile not found' });
      res.json({ message: 'Verification status retrieved', verification: TherapistVerificationService.getVerificationDetails(therapist) });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get verification status', error: error.message });
    }
  }

  /**
   * GET /api/therapist/profile
   */
  static async getProfile(req, res) {
    try {
      const therapist = await Therapist.findOne({ userId: req.user._id }).populate('userId', 'name email phone profileImage');
      if (!therapist) return res.status(404).json({ message: 'Therapist profile not found' });
      res.json({ therapist, isEligible: TherapistVerificationService.isEligibleForService(therapist) });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  }

  /**
   * PUT /api/therapist/profile
   */
  static async updateProfile(req, res) {
    try {
      const allowed = ['specialization', 'experienceYears', 'bio', 'workplace', 'hourlyRate', 'availability', 'languages'];
      const updates = {};
      Object.keys(req.body).forEach(k => { if (allowed.includes(k)) updates[k] = req.body[k]; });
      const therapist = await Therapist.findOneAndUpdate({ userId: req.user._id }, updates, { new: true });
      if (!therapist) return res.status(404).json({ message: 'Therapist profile not found' });
      res.json({ message: 'Profile updated successfully', therapist });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }

  /**
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
      res.status(500).json({ message: 'Failed to get appointments', error: error.message });
    }
  }

  /**
   * PUT /api/therapist/availability
   */
  static async updateAvailability(req, res) {
    try {
      const therapist = await Therapist.findOneAndUpdate(
        { userId: req.user._id }, { availability: req.body.availability }, { new: true }
      );
      if (!therapist) return res.status(404).json({ message: 'Therapist profile not found' });
      res.json({ message: 'Availability updated successfully', availability: therapist.availability });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update availability', error: error.message });
    }
  }

  /**
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
        ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
      res.json({ reviews, stats: { totalReviews, averageRating: Math.round(averageRating * 10) / 10 } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
  }
}

module.exports = TherapistController;
