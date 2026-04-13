const Therapist = require('../models/Therapist');
const User = require('../models/User');
const TherapistVerificationService = require('../services/therapistVerificationService');

class TherapistController {
  // Get therapist profile
  static async getProfile(req, res) {
    try {
      const therapist = await Therapist.findOne({ userId: req.user._id })
        .populate('userId', 'name email phone');

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist profile not found' });
      }

      res.json(therapist);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  }

  // Update therapist profile
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
        return res.status(404).json({ message: 'Therapist profile not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        therapist
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }

  // Get verification status
  static async getVerificationStatus(req, res) {
    try {
      const therapist = await Therapist.findOne({ userId: req.user._id });

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist profile not found' });
      }

      res.json({
        status: therapist.verificationStatus,
        result: therapist.verificationResult,
        licenseExpiryDate: therapist.licenseExpiryDate
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get verification status', error: error.message });
    }
  }

  // Re-upload license for verification
  static async reuploadLicense(req, res) {
    try {
      const { licenseNumber, issuingAuthority, licenseExpiryDate, licenseDocument } = req.body;

      const therapist = await TherapistVerificationService.reverifyTherapist(
        req.user._id,
        { licenseNumber, issuingAuthority, licenseExpiryDate, licenseDocument }
      );

      res.json({
        message: 'License re-uploaded and verification initiated',
        status: therapist.verificationStatus,
        result: therapist.verificationResult
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to re-upload license', error: error.message });
    }
  }

  // Get therapist appointments
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

  // Update availability
  static async updateAvailability(req, res) {
    try {
      const { availability } = req.body;

      const therapist = await Therapist.findOneAndUpdate(
        { userId: req.user._id },
        { availability },
        { new: true }
      );

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist profile not found' });
      }

      res.json({
        message: 'Availability updated successfully',
        availability: therapist.availability
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update availability', error: error.message });
    }
  }
}

module.exports = TherapistController;