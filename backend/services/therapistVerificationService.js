const Therapist = require('../models/Therapist');
const User = require('../models/User');
const { notify } = require('./notificationService');
const { sendEmail } = require('./emailService');

/**
 * Therapist License Verification Service
 * 
 * This system performs preliminary digital verification and does not replace 
 * official licensing by the Ministry of Health or regulatory authorities in Ethiopia.
 * 
 * Verification Status:
 * - VERIFIED: All criteria met
 * - PENDING: Awaiting verification
 * - REJECTED: Critical data missing or invalid
 * - EXPIRED: License has expired
 */

class TherapistVerificationService {
  /**
   * Verify therapist based on Ethiopian licensing practices
   * 
   * Requirements:
   * 1. Valid degree (Psychology, Clinical Psychology, Social Work)
   * 2. Valid license number
   * 3. Issuing authority (Ministry of Health or Regional Bureau)
   * 4. License not expired
   * 5. Competency exam (COC or equivalent)
   */
  static async verifyTherapist(therapistData) {
    try {
      const therapist = therapistData;

      // Step 1: Check if license is expired
      const now = new Date();
      const expiryDate = new Date(therapist.license.licenseExpiryDate);

      if (expiryDate < now) {
        return {
          status: 'EXPIRED',
          notes: 'License has expired',
          verifiedAt: new Date()
        };
      }

      // Step 2: Validate education
      const validDegrees = ['Psychology', 'Clinical Psychology', 'Social Work'];
      const isValidEducation = validDegrees.includes(therapist.education.field);

      if (!isValidEducation) {
        return {
          status: 'REJECTED',
          notes: 'Invalid educational qualification. Must be Psychology, Clinical Psychology, or Social Work',
          verifiedAt: new Date()
        };
      }

      // Step 3: Validate license information
      if (!therapist.license.licenseNumber || therapist.license.licenseNumber.trim().length === 0) {
        return {
          status: 'REJECTED',
          notes: 'Invalid license number',
          verifiedAt: new Date()
        };
      }

      // Step 4: Validate issuing authority
      const validAuthorities = ['Ministry of Health', 'Regional Bureau of Health', 'Other'];
      if (!validAuthorities.includes(therapist.license.issuingAuthority)) {
        return {
          status: 'REJECTED',
          notes: 'Invalid issuing authority',
          verifiedAt: new Date()
        };
      }

      // Step 5: Check competency (COC or exam passed)
      const hasCompetency = therapist.competency.hasCOC || therapist.competency.examPassed;

      if (!hasCompetency) {
        return {
          status: 'PENDING',
          notes: 'Awaiting competency exam results (COC or equivalent)',
          verifiedAt: new Date()
        };
      }

      // Step 6: Check required documents
      if (!therapist.license.licenseDocument) {
        return {
          status: 'PENDING',
          notes: 'Awaiting license document upload',
          verifiedAt: new Date()
        };
      }

      // All criteria met - VERIFIED
      return {
        status: 'VERIFIED',
        notes: 'Successfully verified as a licensed mental health professional',
        verifiedAt: new Date()
      };
    } catch (error) {
      return {
        status: 'REJECTED',
        notes: `Verification error: ${error.message}`,
        verifiedAt: new Date()
      };
    }
  }

  /**
   * Register new therapist
   * Sets initial status to PENDING and runs verification
   */
  static async registerTherapist(userId, therapistData) {
    try {
      // Create new therapist record with PENDING status
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
        verification: {
          status: 'PENDING',
          notes: 'Initial registration - pending verification',
          verifiedAt: null
        }
      });

      // Run automatic verification
      const verificationResult = await this.verifyTherapist(therapist);

      // Update verification status
      therapist.verification = verificationResult;

      // Save to database
      await therapist.save();

      // Notify therapist of verification result
      const user = await User.findById(userId);
      if (user) {
        await notify(userId, `Verification status: ${verificationResult.status} — ${verificationResult.notes}`, 'verification_status', therapist._id);
        sendEmail(user.email, 'therapistVerification', { name: user.name, status: verificationResult.status, notes: verificationResult.notes });
      }

      return therapist;
    } catch (error) {
      throw new Error(`Failed to register therapist: ${error.message}`);
    }
  }

  /**
   * Re-upload license and re-verify
   */
  static async reuploadLicense(userId, licenseData) {
    try {
      const therapist = await Therapist.findOne({ userId });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      // Update license information
      therapist.license = {
        ...therapist.license,
        ...licenseData
      };

      // Reset status to PENDING for re-verification
      therapist.verification.status = 'PENDING';
      therapist.verification.notes = 'License re-uploaded - re-verification in progress';
      therapist.verification.verifiedAt = null;

      await therapist.save();

      // Run verification
      const verificationResult = await this.verifyTherapist(therapist);

      // Update verification status
      therapist.verification = verificationResult;
      await therapist.save();

      return therapist;
    } catch (error) {
      throw new Error(`Failed to re-upload license: ${error.message}`);
    }
  }

  /**
   * Check if therapist is eligible for appointments
   * Only VERIFIED therapists can be booked
   */
  static isEligibleForService(therapist) {
    return therapist.verification.status === 'VERIFIED';
  }

  /**
   * Get verification status details
   */
  static getVerificationDetails(therapist) {
    return {
      status: therapist.verification.status,
      notes: therapist.verification.notes,
      verifiedAt: therapist.verification.verifiedAt,
      licenseExpiryDate: therapist.license.licenseExpiryDate,
      isEligible: this.isEligibleForService(therapist)
    };
  }
}

module.exports = TherapistVerificationService;