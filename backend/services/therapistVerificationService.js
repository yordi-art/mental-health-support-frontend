const Therapist = require('../models/Therapist');
const User = require('../models/User');
const { notify } = require('./notificationService');
const { sendEmail } = require('./emailService');
const { DEV_MODE } = require('../config/devMode');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Call the Python /verify-license endpoint (optional AI enhancement).
 * If Python service is unavailable, returns null — rule-based result is used instead.
 */
async function callPythonVerifier(fileBuffer, fileMimetype, filename, therapistName) {
  try {
    const FormDataPkg = require('form-data');
    const nodeFetch   = require('node-fetch');

    const form = new FormDataPkg();
    form.append('file', fileBuffer, { filename: filename || 'license.pdf', contentType: fileMimetype });
    form.append('therapist_name', therapistName);

    const res = await nodeFetch(`${AI_SERVICE_URL}/verify-license`, {
      method:  'POST',
      body:    form,
      headers: form.getHeaders(),
      timeout: 8000,
    });
    return await res.json();
  } catch {
    return null; // Python service offline — fall back to rule-based result
  }
}

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

    const validAuthorities = ['Ministry of Health', 'Regional Health Bureau', 'Other'];
    if (!validAuthorities.includes(therapist.license.issuingAuthority)) {
      return { status: 'REJECTED', notes: 'Invalid issuing authority.' };
    }

    const hasCompetency = therapist.competency?.hasCOC || therapist.competency?.examPassed;
    if (!hasCompetency) {
      return { status: 'PENDING', notes: 'Awaiting competency certification (COC or licensing exam).' };
    }

    return null;
  }

  // ─── Step 2: AI verification (optional enhancement) ────────────────────────────────────────────

  static async _runAIVerification(fileBuffer, fileMimetype, filename, therapistName) {
    if (!fileBuffer) {
      return { decision: 'PENDING', notes: 'No license document uploaded.', aiDetails: null };
    }

    // Try calling Python AI service (optional)
    const aiResult = await callPythonVerifier(fileBuffer, fileMimetype, filename, therapistName);

    if (!aiResult) {
      // Python offline — document uploaded, so approve based on rule checks alone
      return {
        decision: 'AI_PASSED',
        notes: 'Document uploaded. Rule-based checks passed.',
        aiDetails: { note: 'AI service offline, rule-based approval' },
      };
    }

    // Python returned a result
    const decisionMap = { approved: 'AI_PASSED', review_required: 'PENDING', rejected: 'REJECTED' };
    const decision = decisionMap[aiResult.status] || 'PENDING';

    return {
      decision,
      notes: aiResult.issues?.length
        ? `AI verification: ${aiResult.issues.join('; ')}`
        : 'AI verification passed.',
      aiDetails: {
        status: aiResult.status,
        confidence: aiResult.confidence,
        ml_prediction: aiResult.ml_prediction,
        features: aiResult.features,
        issues: aiResult.issues,
      },
    };
  }

  // ─── Main verification entry point ─────────────────────────────────────────

  static async verifyTherapist(therapistDoc, fileBuffer = null, fileMimetype = null, filename = null) {
    if (DEV_MODE) {
      return { status: 'VERIFIED', notes: 'DEV_MODE: Verification bypassed for testing.', verifiedAt: new Date(), aiDetails: null };
    }

    const ruleResult = this._runRuleChecks(therapistDoc);
    if (ruleResult) return { ...ruleResult, verifiedAt: new Date(), aiDetails: null };

    const therapistName = (await User.findById(therapistDoc.userId))?.name || '';
    const ai = await this._runAIVerification(fileBuffer, fileMimetype, filename, therapistName);

    if (ai.decision === 'AI_PASSED') {
      return { status: 'VERIFIED', notes: 'All checks passed.', verifiedAt: new Date(), aiDetails: ai.aiDetails };
    }
    return {
      status: ai.decision === 'REJECTED' ? 'REJECTED' : 'PENDING',
      notes: ai.notes,
      verifiedAt: new Date(),
      aiDetails: ai.aiDetails,
    };
  }

  // ─── Register new therapist ─────────────────────────────────────────────────

  static async registerTherapist(userId, therapistData, fileBuffer = null, fileMimetype = null, filename = null) {
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

    const result = await this.verifyTherapist(therapist, fileBuffer, fileMimetype, filename);

    therapist.verification = {
      status: result.status,
      notes: result.notes,
      verifiedAt: result.verifiedAt,
      confidence: result.aiDetails?.confidence ? Math.round(result.aiDetails.confidence * 100) : null,
    };

    await therapist.save();

    const user = await User.findById(userId);
    if (user) {
      await notify(userId, `Verification status: ${result.status} — ${result.notes}`, 'verification_status', therapist._id);
      sendEmail(user.email, 'therapistVerification', { name: user.name, status: result.status, notes: result.notes });
    }

    return { therapist, aiDetails: result.aiDetails };
  }

  // ─── Re-upload and re-verify ────────────────────────────────────────────────

  static async reuploadLicense(userId, licenseData, fileBuffer = null, fileMimetype = null, filename = null) {
    const therapist = await Therapist.findOne({ userId });
    if (!therapist) throw new Error('Therapist not found');

    therapist.license = { ...therapist.license.toObject(), ...licenseData };
    therapist.verification = { status: 'PENDING', notes: 'Re-verification in progress...', verifiedAt: null };
    await therapist.save();

    const result = await this.verifyTherapist(therapist, fileBuffer, fileMimetype, filename);

    therapist.verification = {
      status: result.status,
      notes: result.notes,
      verifiedAt: result.verifiedAt,
      confidence: result.aiDetails?.confidence ? Math.round(result.aiDetails.confidence * 100) : null,
    };
    await therapist.save();

    return { therapist, aiDetails: result.aiDetails };
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
