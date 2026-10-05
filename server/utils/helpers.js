const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/** Escapes user input before using it inside a RegExp (prevents ReDoS / regex injection). */
function escapeRegex(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extracts unique, lower-cased hashtags (#word) from post content. */
function extractTags(content = '') {
  const tags = new Set();
  const re = /(^|[^\w&])#([A-Za-z0-9_]{1,50})/g;
  let match;
  while ((match = re.exec(content)) && tags.size < 10) {
    tags.add(match[2].toLowerCase());
  }
  return [...tags];
}

/** Parses ?page & ?limit query params into safe numbers. */
function getPagination(query, defaultLimit = 10, maxLimit = 50) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Deletes a previously uploaded file (only files that live inside /uploads). */
function deleteUploadedFile(publicPath) {
  if (!publicPath || typeof publicPath !== 'string' || !publicPath.startsWith('/uploads/')) return;
  const filePath = path.join(UPLOADS_DIR, path.basename(publicPath));
  if (!filePath.startsWith(UPLOADS_DIR)) return;
  fs.unlink(filePath, () => {}); // ignore errors (file may already be gone)
}

/** Converts a multer file to the public URL path it is served from. */
function fileToPublicPath(file) {
  return file ? `/uploads/${file.filename}` : '';
}

module.exports = { UPLOADS_DIR, escapeRegex, extractTags, getPagination, deleteUploadedFile, fileToPublicPath };
