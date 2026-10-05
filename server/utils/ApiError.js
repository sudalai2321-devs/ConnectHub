/**
 * Error type carrying an HTTP status code. Thrown from controllers/middleware
 * and translated into a JSON response by the central error handler.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
  }

  static badRequest(msg = 'Bad request', errors) {
    return new ApiError(400, msg, errors);
  }
  static unauthorized(msg = 'Not authorized. Please log in.') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'You do not have permission to perform this action.') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Resource not found.') {
    return new ApiError(404, msg);
  }
  static conflict(msg = 'Resource already exists.') {
    return new ApiError(409, msg);
  }
}

module.exports = ApiError;
