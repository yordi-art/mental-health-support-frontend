const express = require('express');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get payments for current user
router.get('/', auth, async (req, res) => {
  try {
    let query = { user: req.user._id };

    if (req.user.role === 'admin') {
      query = {}; // Admin can see all payments
    }

    const payments = await Payment.find(query)
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment
router.post('/', auth, async (req, res) => {
  try {
    const { appointment, amount, paymentMethod } = req.body;

    // Verify appointment belongs to user
    const appointmentDoc = await Appointment.findById(appointment);
    if (!appointmentDoc) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointmentDoc.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payment = new Payment({
      user: req.user._id,
      appointment,
      amount,
      paymentMethod,
      description: `Payment for appointment on ${appointmentDoc.date.toDateString()}`
    });

    await payment.save();

    // Update appointment payment status
    appointmentDoc.paymentStatus = 'paid';
    await appointmentDoc.save();

    const populatedPayment = await Payment.findById(payment._id).populate('appointment');

    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment status (admin only)
router.put('/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('appointment');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;