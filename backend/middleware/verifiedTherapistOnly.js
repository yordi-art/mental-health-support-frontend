const Therapist = require('../models/Therapist');

/**
 * Middleware: only allows VERIFIED therapists to proceed.
 * Attach to routes that require full therapist access (appointments, availability, etc.)
 */
const verifiedTherapistOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'therapist') return next(); // non-therapists pass through

    const therapist = await Therapist.findOne({ userId: req.user._id }, 'verification');
    if (!therapist) {
      return res.status(403).json({ message: 'Therapist profile not found.' });
    }

    const { status } = therapist.verification;

    if (status === 'VERIFIED') return next();

    const messages = {
      PENDING:  'Your account is under verification. Please wait for the system to complete the process.',
      REJECTED: 'Your verification failed. Please re-upload your documents to continue.',
      EXPIRED:  'Your license has expired. Please renew your license and re-upload your documents.',
    };

    return res.status(403).json({
      message: messages[status] || 'Access restricted.',
      verificationStatus: status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification check failed.', error: error.message });
  }
};

module.exports = verifiedTherapistOnly;
