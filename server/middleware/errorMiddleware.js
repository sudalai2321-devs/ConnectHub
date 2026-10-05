const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { deleteUploadedFile, fileToPublicPath } = require('../utils/helpers');

/** 404 handler for unknown API routes. */
function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralised error handler. Translates known error types into meaningful
 * HTTP responses and hides internal details for unexpected (5xx) errors.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors && err.name === 'ApiError' ? err.errors : undefined;

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path === '_id' ? 'ID' : err.path}`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = errors[0]?.message || 'Validation failed';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || err.keyPattern || { field: 1 })[0];
    message = `That ${field} is already taken`;
    errors = [{ field, message }];
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5 MB or smaller'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file field'
          : 'File upload failed';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  }

  // A file may already be stored by multer when validation fails afterwards — remove it.
  if (req.file) deleteUploadedFile(fileToPublicPath(req.file));

  if (status >= 500) {
    console.error(`💥 ${req.method} ${req.originalUrl}`, err);
    message = 'Something went wrong on our end. Please try again.';
    errors = undefined;
  }

  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = { notFound, errorHandler };
