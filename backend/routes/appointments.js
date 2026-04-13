const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get appointments for current user
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'therapist') {
      query.therapist = req.user._id;
    }
    // Admin can see all

    const appointments = await Appointment.find(query)
      .populate('client', 'name email')
      .populate('therapist', 'name email specialties')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create appointment
router.post('/', auth, requireRole(['client']), async (req, res) => {
  try {
    const { therapist, date, startTime, endTime, sessionType, notes } = req.body;

    // Get therapist's hourly rate
    const therapistUser = await require('../models/User').findById(therapist);
    if (!therapistUser) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    const price = therapistUser.hourlyRate || 50; // Default rate

    const appointment = new Appointment({
      client: req.user._id,
      therapist,
      date,
      startTime,
      endTime,
      sessionType,
      notes,
      price
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'name email')
      .populate('therapist', 'name email specialties');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'client' && appointment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'therapist' && appointment.therapist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate('client', 'name email')
      .populate('therapist', 'name email specialties');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only client or admin can delete
    if (req.user.role === 'client' && appointment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;