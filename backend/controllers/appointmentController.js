const Appointment = require('../models/Appointment');
const Therapist = require('../models/Therapist');
const Notification = require('../models/Notification');

class AppointmentController {
  // Get user appointments
  static async getAppointments(req, res) {
    try {
      let query = {};

      if (req.user.role === 'client') {
        query.clientId = req.user._id;
      } else if (req.user.role === 'therapist') {
        query.therapistId = req.user._id;
      }
      // Admin can see all

      const appointments = await Appointment.find(query)
        .populate('clientId', 'name email phone')
        .populate('therapistId', 'userId')
        .populate({
          path: 'therapistId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        })
        .sort({ date: -1, time: -1 });

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get appointments', error: error.message });
    }
  }

  // Create appointment
  static async createAppointment(req, res) {
    try {
      const { therapistId, date, time, sessionType, notes } = req.body;

      // Check if therapist exists and is verified
      const therapist = await Therapist.findOne({
        userId: therapistId,
        verificationStatus: 'verified'
      });

      if (!therapist) {
        return res.status(400).json({ message: 'Therapist not found or not verified' });
      }

      // Check for conflicting appointments
      const conflictingAppointment = await Appointment.findOne({
        therapistId,
        date,
        time,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ message: 'Time slot not available' });
      }

      // Create appointment
      const appointment = new Appointment({
        clientId: req.user._id,
        therapistId,
        date,
        time,
        sessionType,
        notes,
        paymentStatus: 'pending'
      });

      await appointment.save();

      // Create notification for therapist
      await Notification.create({
        userId: therapistId,
        message: `New appointment request from ${req.user.name}`,
        type: 'appointment_reminder',
        relatedId: appointment._id
      });

      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('clientId', 'name email phone')
        .populate({
          path: 'therapistId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        });

      res.status(201).json({
        message: 'Appointment created successfully',
        appointment: populatedAppointment
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create appointment', error: error.message });
    }
  }

  // Update appointment status
  static async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check permissions
      if (req.user.role === 'client' && appointment.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'therapist' && appointment.therapistId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      appointment.status = status;
      await appointment.save();

      // Create notification
      let notificationMessage = '';
      let notificationUserId = '';

      if (status === 'confirmed' && req.user.role === 'therapist') {
        notificationMessage = 'Your appointment has been confirmed';
        notificationUserId = appointment.clientId;
      } else if (status === 'cancelled') {
        notificationMessage = 'Your appointment has been cancelled';
        notificationUserId = req.user.role === 'therapist' ? appointment.clientId : appointment.therapistId;
      }

      if (notificationMessage && notificationUserId) {
        await Notification.create({
          userId: notificationUserId,
          message: notificationMessage,
          type: 'appointment_confirmed',
          relatedId: appointment._id
        });
      }

      const updatedAppointment = await Appointment.findById(id)
        .populate('clientId', 'name email phone')
        .populate({
          path: 'therapistId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        });

      res.json({
        message: 'Appointment status updated',
        appointment: updatedAppointment
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update appointment', error: error.message });
    }
  }

  // Cancel appointment
  static async cancelAppointment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Only client or therapist can cancel
      if (req.user.role === 'client' && appointment.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'therapist' && appointment.therapistId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      appointment.status = 'cancelled';
      await appointment.save();

      // Create notification for the other party
      const notificationUserId = req.user.role === 'client' ? appointment.therapistId : appointment.clientId;

      await Notification.create({
        userId: notificationUserId,
        message: 'Your appointment has been cancelled',
        type: 'appointment_cancelled',
        relatedId: appointment._id
      });

      res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to cancel appointment', error: error.message });
    }
  }
}

module.exports = AppointmentController;