const multer = require('multer');
const path = require('path');

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Store in memory — we send buffer directly to Google Vision, no disk needed
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
  // Validate extension matches mimetype
  const ext = path.extname(file.originalname).toLowerCase();
  const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  if (!validExts.includes(ext)) {
    return cb(new Error('Invalid file extension.'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
});

// Multer error handler middleware
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}

module.exports = { upload, handleUploadError };
