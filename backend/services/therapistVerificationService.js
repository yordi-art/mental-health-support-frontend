const Therapist = require('../models/Therapist');

class TherapistVerificationService {
  // Simulate automatic license verification
  static async verifyLicense(therapistData) {
    const {
      licenseNumber,
      issuingAuthority,
      licenseExpiryDate,
      licenseDocument
    } = therapistData;

    try {
      // Simulate verification process
      const verificationResult = await this.simulateVerification(
        licenseNumber,
        issuingAuthority,
        licenseExpiryDate,
        licenseDocument
      );

      return {
        status: verificationResult.status,
        result: verificationResult.message,
        verifiedAt: new Date()
      };
    } catch (error) {
      return {
        status: 'failed',
        result: 'Verification process failed',
        verifiedAt: new Date()
      };
    }
  }

  // Simulate the verification logic
  static async simulateVerification(licenseNumber, issuingAuthority, expiryDate, document) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check license number format (basic validation)
    if (!licenseNumber || licenseNumber.length < 5) {
      return {
        status: 'failed',
        message: 'Invalid license number format'
      };
    }

    // Check expiry date
    const now = new Date();
    const expiry = new Date(expiryDate);

    if (expiry < now) {
      return {
        status: 'expired',
        message: 'License has expired'
      };
    }

    // Simulate random verification results for demo
    const random = Math.random();

    if (random < 0.7) {
      return {
        status: 'verified',
        message: 'License verified successfully'
      };
    } else if (random < 0.85) {
      return {
        status: 'flagged',
        message: 'License flagged for manual review'
      };
    } else {
      return {
        status: 'failed',
        message: 'License verification failed'
      };
    }
  }

  // Re-verify therapist license
  static async reverifyTherapist(therapistId, newLicenseData) {
    try {
      const therapist = await Therapist.findById(therapistId);
      if (!therapist) {
        throw new Error('Therapist not found');
      }

      // Update license data
      therapist.licenseNumber = newLicenseData.licenseNumber;
      therapist.issuingAuthority = newLicenseData.issuingAuthority;
      therapist.licenseExpiryDate = newLicenseData.licenseExpiryDate;
      therapist.licenseDocument = newLicenseData.licenseDocument;
      therapist.verificationStatus = 'pending';

      // Run verification
      const verification = await this.verifyLicense(therapist);

      therapist.verificationStatus = verification.status;
      therapist.verificationResult = verification.result;

      await therapist.save();

      return therapist;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TherapistVerificationService;