const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Therapist = require('../models/Therapist');
const { sendEmail } = require('../services/emailService');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, role, phone, gender, dateOfBirth } = req.body;

      if (!name || !email || !password)
        return res.status(400).json({ message: 'Name, email, and password are required' });

      if (password.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });

      if (role === 'therapist')
        return res.status(400).json({ message: 'Therapists must register via POST /api/therapist/register' });

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: 'User already exists with this email' });

      const user = new User({
        name, email, password,
        role: role || 'client',
        ...(phone       && { phone }),
        ...(gender      && { gender }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      });

      await user.save();

      try { await sendEmail(user.email, 'welcome', { name: user.name }); }
      catch (e) { console.error('Welcome email failed:', e.message); }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

      if (!user.isActive) return res.status(400).json({ message: 'Account is deactivated' });

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }

  // GET /auth/profile
  // ProfilePage reads: user.name, user.email, user.phone, user.gender,
  //                    user.dateOfBirth, user.emergencyContact
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      let additionalData = {};
      if (user.role === 'therapist') {
        const therapist = await Therapist.findOne({ userId: user._id });
        if (therapist) additionalData.therapist = therapist;
      }

      res.json({ user, ...additionalData });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  }

  // PUT /auth/profile
  // ProfilePage saves: name, phone, emergencyContact, notificationPreferences
  static async updateProfile(req, res) {
    try {
      const allowed = ['name', 'phone', 'profileImage', 'emergencyContact', 'notificationPreferences'];
      const updates = {};
      Object.keys(req.body).forEach(k => { if (allowed.includes(k)) updates[k] = req.body[k]; });

      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }
}

module.exports = AuthController;
