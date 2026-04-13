const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

class ReviewController {
  // Get reviews for a therapist
  static async getTherapistReviews(req, res) {
    try {
      const { therapistId } = req.params;

      const reviews = await Review.find({ therapistId })
        .populate('clientId', 'name')
        .populate('appointmentId', 'date sessionType')
        .sort({ createdAt: -1 });

      // Calculate average rating
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
      res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
  }

  // Create review
  static async createReview(req, res) {
    try {
      const { appointmentId, rating, comment } = req.body;

      // Verify appointment exists and belongs to user
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if appointment is completed
      if (appointment.status !== 'completed') {
        return res.status(400).json({ message: 'Can only review completed appointments' });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({ appointmentId });
      if (existingReview) {
        return res.status(400).json({ message: 'Review already exists for this appointment' });
      }

      // Create review
      const review = new Review({
        clientId: req.user._id,
        therapistId: appointment.therapistId,
        appointmentId,
        rating,
        comment
      });

      await review.save();

      const populatedReview = await Review.findById(review._id)
        .populate('clientId', 'name')
        .populate('appointmentId', 'date sessionType');

      res.status(201).json({
        message: 'Review submitted successfully',
        review: populatedReview
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
  }

  // Update review
  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (review.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      review.rating = rating;
      review.comment = comment;
      await review.save();

      const updatedReview = await Review.findById(id)
        .populate('clientId', 'name')
        .populate('appointmentId', 'date sessionType');

      res.json({
        message: 'Review updated successfully',
        review: updatedReview
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update review', error: error.message });
    }
  }

  // Delete review
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (review.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await Review.findByIdAndDelete(id);

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
  }

  // Get user's reviews
  static async getUserReviews(req, res) {
    try {
      const reviews = await Review.find({ clientId: req.user._id })
        .populate({
          path: 'therapistId',
          populate: {
            path: 'userId',
            select: 'name'
          }
        })
        .populate('appointmentId', 'date sessionType')
        .sort({ createdAt: -1 });

      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
  }
}

module.exports = ReviewController;