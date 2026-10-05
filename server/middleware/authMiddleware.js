const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/token');

/**
 * Requires a valid `Authorization: Bearer <jwt>` header.
 * Attaches the authenticated user (without password) to `req.user`.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) throw ApiError.unauthorized('Not authorized. Please log in.');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid session. Please log in again.'
    );
  }

  const user = await User.findById(decoded.id).select('+tokenVersion');
  if (!user) throw ApiError.unauthorized('This account no longer exists.');
  if ((user.tokenVersion || 0) !== (decoded.tv || 0)) {
    throw ApiError.unauthorized('Your session has ended. Please log in again.');
  }

  req.user = user;
  next();
});

module.exports = { protect };
