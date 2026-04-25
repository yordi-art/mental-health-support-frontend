const Therapist = require('../models/Therapist');
const User = require('../models/User');
const { notify } = require('./notificationService');
const { sendEmail } = require('./emailService');
const ocrService = require('./ocrService');
const { extractLicenseData } = require('./licenseExtractor');
const { validateLicenseData } = require('./licenseValidator');
const { DEV_MODE } = require('../config/devMode');

/**
 * Therapist Verification Service
 *
 * Verification pipeline:
 *  1. Rule-based checks (expiry, education, authority, competency)
 *  2. OCR extraction from uploaded document (if file buffer provided)
 *  3. Cross-validation of OCR data vs user input
 *  4. Final decision
 */

class TherapistVerificationService {

  // ─── Step 1: Rule-based checks ─────────────────────────────────────────────

  static _runRuleChecks(therapist) {
    const now = new Date();
    const expiryDate = new Date(therapist.license.licenseExpiryDate);

    if (expiryDate < now) {
      return { status: 'EXPIRED', notes: 'License has expired. Please renew your license.' };
    }

    const validFields = ['Psychology', 'Clinical Psychology', 'Social Work'];
    if (!validFields.includes(therapist.education.field)) {
      return { status: 'REJECTED', notes: 'Invalid educational qualification. Must be Psychology, Clinical Psychology, or Social Work.' };
    }

    if (!therapist.license.licenseNumber?.trim()) {
      return { status: 'REJECTED', notes: 'License number is missing or invalid.' };
    }

    const validAuthorities = ['Ministry of Health', 'Regional Bureau of Health', 'Other'];
    if (!validAuthorities.includes(therapist.license.issuingAuthority)) {
      return { status: 'REJECTED', notes: 'Invalid issuing authority.' };
    }

    const hasCompetency = therapist.competency?.hasCOC || therapist.competency?.examPassed;
    if (!hasCompetency) {
      return { status: 'PENDING', notes: 'Awaiting competency certification (COC or licensing exam).' };
    }

    return null; // all rule checks passed
  }

  // ─── Step 2 & 3: OCR pipeline ──────────────────────────────────────────────

  static async _runOCRVerification(fileBuffer, fileMimetype, licenseInput) {
    // No file provided — skip OCR
    if (!fileBuffer) {
      return {
        ocrAttempted: false,
        decision: 'PENDING',
        notes: 'No license document uploaded. Please upload your license image or PDF.',
        ocrDetails: null,
      };
    }

    try {
      // Extract text via Google Vision
      const ocrResult = await ocrService.extractText({ buffer: fileBuffer, mimetype: fileMimetype, size: fileBuffer.length });

      if (!ocrResult.success) {
        return {
          ocrAttempted: true,
          decision: 'PENDING',
          notes: `Unable to read document: ${ocrResult.error}. Please upload a clearer image.`,
          ocrDetails: { success: false, error: ocrResult.error },
        };
      }

      // Parse structured fields from raw text
      const extracted = extractLicenseData(ocrResult.text);

      // Validate extracted data against user input
      const validation = validateLicenseData(extracted, licenseInput, ocrResult.confidence);

      return {
        ocrAttempted: true,
        decision: validation.decision,   // 'OCR_PASSED' | 'REJECTED' | 'PENDING'
        notes: validation.notes,
        ocrDetails: {
          success: true,
          confidence: ocrResult.confidence,
          wordCount: ocrResult.wordCount,
          extractedFields: extracted.extractedFields,
          unextracted: extracted.unmatched,
          checks: validation.checks,
          mismatches: validation.mismatches,
        },
      };
    } catch (err) {
      // OCR service unavailable (e.g. no credentials) — degrade gracefully
      console.warn('[OCR] Service unavailable:', err.message);
      return {
        ocrAttempted: true,
        decision: 'PENDING',
        notes: 'Automatic document verification is temporarily unavailable. Your submission has been queued for manual review.',
        ocrDetails: { success: false, error: err.message },
      };
    }
  }

  // ─── Main verification entry point ─────────────────────────────────────────

  /**
   * @param {object} therapistDoc  - Mongoose Therapist document
   * @param {Buffer} [fileBuffer]  - raw file buffer from multer
   * @param {string} [fileMimetype]
   * @returns {object} { status, notes, verifiedAt, ocrDetails }
   */
  static async verifyTherapist(therapistDoc, fileBuffer = null, fileMimetype = null) {
    // Verification bypass is enabled only for development/testing and must be disabled in production.
    if (DEV_MODE) {
      return {
        status: 'VERIFIED',
        notes: 'DEV_MODE: Verification bypassed for testing.',
        verifiedAt: new Date(),
        ocrDetails: null,
      };
    }

    // ── Full verification pipeline (runs when DEV_MODE = false) ──────────────

    // Step 1: Rule-based checks
    const ruleResult = this._runRuleChecks(therapistDoc);
    if (ruleResult) {
      return { ...ruleResult, verifiedAt: new Date(), ocrDetails: null };
    }

    // Step 2 & 3: OCR pipeline
    const ocr = await this._runOCRVerification(
      fileBuffer,
      fileMimetype,
      therapistDoc.license
    );

    if (ocr.decision === 'OCR_PASSED') {
      return { status: 'VERIFIED', notes: 'All checks passed.', verifiedAt: new Date(), ocrDetails: ocr.ocrDetails };
    }

    return {
      status: ocr.decision === 'REJECTED' ? 'REJECTED' : 'PENDING',
      notes: ocr.notes,
      verifiedAt: new Date(),
      ocrDetails: ocr.ocrDetails,
    };
  }

  // ─── Register new therapist ─────────────────────────────────────────────────

  static async registerTherapist(userId, therapistData, fileBuffer = null, fileMimetype = null) {
    const therapist = new Therapist({
      userId,
      specialization: therapistData.specialization,
      experienceYears: therapistData.experienceYears,
      bio: therapistData.bio,
      workplace: therapistData.workplace,
      education: therapistData.education,
      license: therapistData.license,
      competency: therapistData.competency,
      languages: therapistData.languages,
      hourlyRate: therapistData.hourlyRate,
      verification: { status: 'PENDING', notes: 'Verification in progress...', verifiedAt: null },
    });

    const result = await this.verifyTherapist(therapist, fileBuffer, fileMimetype);

    therapist.verification = {
      status: result.status,
      notes: result.notes,
      verifiedAt: result.verifiedAt,
    };

    await therapist.save();

    // Notify
    const user = await User.findById(userId);
    if (user) {
      await notify(userId, `Verification status: ${result.status} — ${result.notes}`, 'verification_status', therapist._id);
      sendEmail(user.email, 'therapistVerification', { name: user.name, status: result.status, notes: result.notes });
    }

    return { therapist, ocrDetails: result.ocrDetails };
  }

  // ─── Re-upload and re-verify ────────────────────────────────────────────────

  static async reuploadLicense(userId, licenseData, fileBuffer = null, fileMimetype = null) {
    const therapist = await Therapist.findOne({ userId });
    if (!therapist) throw new Error('Therapist not found');

    therapist.license = { ...therapist.license.toObject(), ...licenseData };
    therapist.verification = { status: 'PENDING', notes: 'Re-verification in progress...', verifiedAt: null };
    await therapist.save();

    const result = await this.verifyTherapist(therapist, fileBuffer, fileMimetype);

    therapist.verification = {
      status: result.status,
      notes: result.notes,
      verifiedAt: result.verifiedAt,
    };
    await therapist.save();

    return { therapist, ocrDetails: result.ocrDetails };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  static isEligibleForService(therapist) {
    return therapist.verification.status === 'VERIFIED';
  }

  static getVerificationDetails(therapist) {
    return {
      status: therapist.verification.status,
      notes: therapist.verification.notes,
      verifiedAt: therapist.verification.verifiedAt,
      licenseExpiryDate: therapist.license.licenseExpiryDate,
      isEligible: this.isEligibleForService(therapist),
    };
  }
}

module.exports = TherapistVerificationService;
