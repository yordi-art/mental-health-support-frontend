/**
 * DEV_MODE Configuration
 * Verification bypass is enabled only for development/testing and must be disabled in production.
 *
 * When DEV_MODE = true:
 *   - Therapist verificationStatus is automatically set to "VERIFIED"
 *   - All license/education/OCR checks are skipped
 *   - Therapists can register, login, access dashboard, and appear in therapist list
 *
 * Set DEV_MODE = false (or DEV_MODE env var to 'false') to restore full verification pipeline.
 */

const DEV_MODE = process.env.DEV_MODE !== 'false'; // TEMPORARY — set DEV_MODE=false in production

module.exports = { DEV_MODE };
