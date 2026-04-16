const express = require('express');
const Therapist = require('../models/Therapist');
const Review = require('../models/Review');

const router = express.Router();

// GET /api/therapists — ONLY returns VERIFIED therapists (backend-enforced)
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;

    // Step 1: find all VERIFIED therapist profiles
    const therapistFilter = { 'verification.status': 'VERIFIED' };
    if (specialization && specialization !== 'All') {
      therapistFilter.specialization = { $in: [specialization] };
    }

    const therapistProfiles = await Therapist.find(therapistFilter)
      .populate('userId', 'name email profileImage isActive')
      .lean();

    // Step 2: filter out inactive users and apply name search
    const results = therapistProfiles
      .filter(t => t.userId && t.userId.isActive !== false)
      .filter(t => !search || t.userId.name.toLowerCase().includes(search.toLowerCase()));

    // Step 3: attach average rating
    const enriched = await Promise.all(results.map(async (t) => {
      const ratingAgg = await Review.aggregate([
        { $match: { therapistId: t._id } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      return {
        _id: t._id,
        userId: t.userId._id,
        name: t.userId.name,
        email: t.userId.email,
        profileImage: t.userId.profileImage,
        specialization: t.specialization,
        experienceYears: t.experienceYears,
        bio: t.bio,
        workplace: t.workplace,
        hourlyRate: t.hourlyRate,
        languages: t.languages,
        availability: t.availability,
        verificationStatus: t.verification.status,
        rating: ratingAgg[0] ? Math.round(ratingAgg[0].avg * 10) / 10 : 0,
        reviewCount: ratingAgg[0]?.count || 0,
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/therapists/:id — only returns if VERIFIED
router.get('/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findOne({
      _id: req.params.id,
      'verification.status': 'VERIFIED'
    }).populate('userId', 'name email profileImage').lean();

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found or not verified' });
    }

    const ratingAgg = await Review.aggregate([
      { $match: { therapistId: therapist._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      ...therapist,
      name: therapist.userId.name,
      email: therapist.userId.email,
      profileImage: therapist.userId.profileImage,
      rating: ratingAgg[0] ? Math.round(ratingAgg[0].avg * 10) / 10 : 0,
      reviewCount: ratingAgg[0]?.count || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;