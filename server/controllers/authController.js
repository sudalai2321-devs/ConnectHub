const User = require('../models/User');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');
const serialize = require('../utils/serialize');

/**
 * POST /api/auth/register
 * Creates a new account and returns a JWT.
 */
const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] }).select('username email').lean();
  if (existing) {
    const field = existing.username === username ? 'username' : 'email';
    throw new ApiError(409, `That ${field} is already taken`, [
      { field, message: `That ${field} is already taken` },
    ]);
  }

  const user = await User.create({ name, username, email, password });
  const token = generateToken(user);

  res.status(201).json({ token, user: serialize.selfUser(user, 0) });
});

/**
 * POST /api/auth/login
 * Accepts `identifier` (email or username) + `password`.
 */
const login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.identifier).trim().toLowerCase();
  const { password } = req.body;

  const query = identifier.includes('@') ? { email: identifier } : { username: identifier.replace(/^@/, '') };
  const user = await User.findOne(query).select('+password +tokenVersion');

  if (!user || !(await user.matchPassword(password))) {
    throw ApiError.unauthorized('Invalid email/username or password');
  }

  const postsCount = await Post.countDocuments({ author: user._id });
  res.json({ token: generateToken(user), user: serialize.selfUser(user, postsCount) });
});

/** GET /api/auth/me — returns the currently authenticated user. */
const getMe = asyncHandler(async (req, res) => {
  const postsCount = await Post.countDocuments({ author: req.user._id });
  res.json({ user: serialize.selfUser(req.user, postsCount) });
});

/**
 * POST /api/auth/logout
 * Bumps the user's token version so every previously issued JWT becomes invalid.
 */
const logout = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  res.json({ message: 'Logged out successfully' });
});

module.exports = { register, login, getMe, logout };
