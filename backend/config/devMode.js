/**
 * DEV_MODE Configuration
 *
 * When DEV_MODE = true  → verification is bypassed, all therapists auto-VERIFIED (testing only)
 * When DEV_MODE = false → full AI verification pipeline runs (production)
 *
 * Controlled via DEV_MODE environment variable in backend/.env
 */

const DEV_MODE = process.env.DEV_MODE === 'true'; // default FALSE — real verification runs

module.exports = { DEV_MODE };
