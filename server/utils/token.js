const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let fallbackSecret = null;

/** Returns the JWT secret. In development a random per-process secret is used if none is set. */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret !== 'replace_me_with_a_long_random_secret') return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production.');
  }
  if (!fallbackSecret) {
    fallbackSecret = crypto.randomBytes(48).toString('hex');
    console.warn('⚠️  JWT_SECRET is not set — using a temporary secret. Sessions will reset on restart.');
  }
  return fallbackSecret;
}

/**
 * Signs a JWT for the given user. `tv` (token version) lets the server
 * invalidate every issued token for a user on logout.
 */
function generateToken(user) {
  return jwt.sign({ id: String(user._id), tv: user.tokenVersion || 0 }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { generateToken, verifyToken, getJwtSecret };
