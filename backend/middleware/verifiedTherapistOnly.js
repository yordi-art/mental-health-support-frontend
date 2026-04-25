const Therapist = require('../models/Therapist');
const { DEV_MODE } = require('../config/devMode');

/**
 * Middleware: only allows VERIFIED therapists to proceed.
 * Verification bypass is enabled only for development/testing and must be disabled in production.
 */
const verifiedTherapistOnly = async (req, res, next) => {
  // DEV_MODE: skip verification check for testing
  if (DEV_MODE) return next();

  try {
    const therapist = await Therapist.findOne({ userId: req.user._id });
    if (!therapist || therapist.verification.status !== 'VERIFIED') {
      return res.status(403).json({ message: 'Access denied. Therapist verification required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Verification check failed', error: error.message });
  }
};

module.exports = verifiedTherapistOnly;
