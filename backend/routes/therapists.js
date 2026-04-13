const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all therapists
router.get('/', async (req, res) => {
  try {
    const { specialty, location } = req.query;

    let query = { role: 'therapist', isVerified: true };

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const therapists = await User.find(query)
      .select('-password -verificationDocuments')
      .sort({ createdAt: -1 });

    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get therapist by ID
router.get('/:id', async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'therapist',
      isVerified: true
    }).select('-password -verificationDocuments');

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    res.json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update therapist profile (therapist only)
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;

    const therapist = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password -verificationDocuments');

    res.json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;