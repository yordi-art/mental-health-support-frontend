const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const { notify } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

class PaymentController {
  // Get user payments
  static async getPayments(req, res) {
    try {
      let query = { userId: req.user._id };

      if (req.user.role === 'admin') {
        query = {}; // Admin can see all payments
      }

      const payments = await Payment.find(query)
        .populate('appointmentId')
        .sort({ createdAt: -1 });

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get payments', error: error.message });
    }
  }

  // Create payment
  static async createPayment(req, res) {
    try {
      const { appointmentId, amount, paymentMethod } = req.body;

      // Verify appointment belongs to user
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (appointment.paymentStatus === 'paid') {
        return res.status(400).json({ message: 'Appointment already paid' });
      }

      // Simulate payment processing
      const paymentResult = await this.processPayment(amount, paymentMethod);

      if (!paymentResult.success) {
        return res.status(400).json({ message: paymentResult.message });
      }

      // Create payment record
      const payment = new Payment({
        userId: req.user._id,
        appointmentId,
        amount,
        paymentMethod,
        status: 'paid',
        transactionId: paymentResult.transactionId
      });

      await payment.save();

      // Update appointment payment status
      appointment.paymentStatus = 'paid';
      await appointment.save();

      // Notify + email
      await notify(req.user._id, `Payment of ${amount} ETB successful for appointment`, 'payment_success', payment._id);
      sendEmail(req.user.email, 'paymentConfirmation', {
        name: req.user.name,
        amount,
        transactionId: paymentResult.transactionId,
        appointmentDate: appointment.date,
      });

      const populatedPayment = await Payment.findById(payment._id).populate('appointmentId');

      res.status(201).json({
        message: 'Payment processed successfully',
        payment: populatedPayment
      });
    } catch (error) {
      res.status(500).json({ message: 'Payment failed', error: error.message });
    }
  }

  // Simulate payment processing
  static async processPayment(amount, paymentMethod) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Payment successful'
      };
    } else {
      return {
        success: false,
        message: 'Payment failed. Please try again.'
      };
    }
  }

  // Get payment by ID
  static async getPaymentById(req, res) {
    try {
      const payment = await Payment.findById(req.params.id).populate('appointmentId');

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Check ownership
      if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get payment', error: error.message });
    }
  }

  // Admin: Update payment status
  static async updatePaymentStatus(req, res) {
    try {
      const { status } = req.body;

      const payment = await Payment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('appointmentId');

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Update appointment payment status if needed
      if (status === 'refunded') {
        await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'refunded' });
      }

      res.json({
        message: 'Payment status updated',
        payment
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update payment status', error: error.message });
    }
  }
}

module.exports = PaymentController;