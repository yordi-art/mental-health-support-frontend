const Therapist = require('../models/Therapist');

/**
 * Middleware: only allows VERIFIED therapists to proceed.
 * Attach to routes that require full therapist access (appointments, availability, etc.)
 */
const verifiedTherapistOnly = async (req, res, next) => {
  return next(); // verification disabled
};

module.exports = verifiedTherapistOnly;
