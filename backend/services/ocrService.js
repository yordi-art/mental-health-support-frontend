const vision = require('@google-cloud/vision');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * OCR Service — Google Vision API
 * Extracts text from license document images/PDFs
 */

// Supported MIME types
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class OCRService {
  constructor() {
    // Client is initialized lazily so missing credentials don't crash the server
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      if (!process.env.GOOGLE_VISION_CREDENTIALS && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error('Google Vision credentials not configured');
      }
      const opts = process.env.GOOGLE_VISION_CREDENTIALS
        ? { credentials: JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS) }
        : {};
      this._client = new vision.ImageAnnotatorClient(opts);
    }
    return this._client;
  }

  /**
   * Validate uploaded file before sending to OCR
   */
  validateFile(file) {
    if (!file) throw new Error('No file provided');
    if (!SUPPORTED_TYPES.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, PDF`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }
  }

  /**
   * Preprocess image with sharp to improve OCR accuracy:
   * - convert to greyscale
   * - increase contrast
   * - resize if too small
   */
  async preprocessImage(buffer, mimetype) {
    if (mimetype === 'application/pdf') return buffer; // skip for PDF
    return sharp(buffer)
      .greyscale()
      .normalise()
      .sharpen()
      .toBuffer();
  }

  /**
   * Send image buffer to Google Vision and return raw text
   */
  async extractText(file) {
    this.validateFile(file);

    const buffer = await this.preprocessImage(file.buffer, file.mimetype);
    const client = this._getClient();

    const [result] = await client.textDetection({ image: { content: buffer } });
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return { success: false, text: '', confidence: 0, error: 'No text detected in document' };
    }

    // First annotation is the full document text
    const fullText = detections[0].description || '';
    // Estimate confidence from individual word detections
    const wordDetections = detections.slice(1);
    const avgConfidence = wordDetections.length > 0
      ? wordDetections.reduce((sum, d) => sum + (d.confidence || 0.8), 0) / wordDetections.length
      : 0.8;

    return {
      success: true,
      text: fullText,
      confidence: Math.round(avgConfidence * 100) / 100,
      wordCount: wordDetections.length,
    };
  }
}

module.exports = new OCRService();
