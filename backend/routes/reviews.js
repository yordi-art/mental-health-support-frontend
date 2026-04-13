const express = require('express');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a therapist
router.get('/therapist/:therapistId', async (req, res) => {
  try {
    const reviews = await Review.find({ therapist: req.params.therapistId })
      .populate('client', 'name')
      .populate('appointment', 'date sessionType')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { appointment, rating, comment } = req.body;

    // Verify appointment exists and belongs to user
    const appointmentDoc = await Appointment.findById(appointment);
    if (!appointmentDoc) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointmentDoc.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if appointment is completed
    if (appointmentDoc.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed appointments' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointment });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this appointment' });
    }

    const review = new Review({
      client: req.user._id,
      therapist: appointmentDoc.therapist,
      appointment,
      rating,
      comment
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('client', 'name')
      .populate('appointment', 'date sessionType');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { rating, comment } = req.body;
    review.rating = rating;
    review.comment = comment;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('client', 'name')
      .populate('appointment', 'date sessionType');

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;