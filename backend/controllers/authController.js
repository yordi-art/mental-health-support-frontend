const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Therapist = require('../models/Therapist');
const TherapistVerificationService = require('../services/therapistVerificationService');

class AuthController {
  // Register user
  static async register(req, res) {
    try {
      const { name, email, password, role, phone, gender, dateOfBirth } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        role: role || 'client',
        phone,
        gender,
        dateOfBirth: new Date(dateOfBirth)
      });

      await user.save();

      // If therapist, create therapist profile and start verification
      if (role === 'therapist') {
        const therapistData = req.body.therapistData;
        if (!therapistData) {
          // Delete user if therapist data not provided
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({ message: 'Therapist data required for therapist registration' });
        }

        const therapist = new Therapist({
          userId: user._id,
          ...therapistData
        });

        await therapist.save();

        // Start automatic verification
        const verification = await TherapistVerificationService.verifyLicense(therapist);
        therapist.verificationStatus = verification.status;
        therapist.verificationResult = verification.result;
        await therapist.save();
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(400).json({ message: 'Account is deactivated' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id);

      let additionalData = {};
      if (user.role === 'therapist') {
        const therapist = await Therapist.findOne({ userId: user._id });
        if (therapist) {
          additionalData.therapist = therapist;
        }
      }

      res.json({
        user,
        ...additionalData
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const updates = req.body;
      const allowedUpdates = ['name', 'phone', 'profileImage'];

      // Filter allowed updates
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        filteredUpdates,
        { new: true }
      );

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }
}

module.exports = AuthController;