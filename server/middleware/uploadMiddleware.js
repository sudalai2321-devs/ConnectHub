const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { UPLOADS_DIR } = require('../utils/helpers');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Extension is derived from the (validated) mimetype, never from the client file name.
const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ALLOWED[file.mimetype]}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    cb(ApiError.badRequest('Only JPG, PNG, GIF or WEBP images are allowed'));
  },
});

module.exports = { upload };
