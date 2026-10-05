const User = require('../models/User');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const serialize = require('../utils/serialize');
const { escapeRegex, deleteUploadedFile, fileToPublicPath } = require('../utils/helpers');
const { createNotification, removeNotifications } = require('../utils/notify');

const LIST_FIELDS = 'name username profileImage bio followers';

/** GET /api/users/:username — public profile of a user. */
const getUserByUsername = asyncHandler(async (req, res) => {
  const username = String(req.params.username).toLowerCase().replace(/^@/, '');
  const user = await User.findOne({ username }).lean();
  if (!user) throw ApiError.notFound('User not found');

  const postsCount = await Post.countDocuments({ author: user._id });
  res.json({ user: serialize.profile(user, req.user, postsCount) });
});

/**
 * PUT /api/users/profile — update the logged-in user's own profile.
 * Always operates on req.user, so a user can never edit someone else's profile.
 * Accepts multipart/form-data (optional `profileImage` file).
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  const { name, bio, location, removeImage } = req.body;
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;

  const previousImage = user.profileImage;
  if (req.file) {
    user.profileImage = fileToPublicPath(req.file);
  } else if (removeImage === 'true' || removeImage === true) {
    user.profileImage = '';
  }

  await user.save();
  if (previousImage !== user.profileImage) deleteUploadedFile(previousImage);

  const postsCount = await Post.countDocuments({ author: user._id });
  res.json({ user: serialize.selfUser(user, postsCount), message: 'Profile updated' });
});

/** GET /api/users/search?q= — search users by name, username or bio. */
const searchUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim().replace(/^@/, '');
  const limit = Math.min(30, Math.max(1, parseInt(req.query.limit, 10) || 20));
  if (!q) return res.json({ users: [] });

  const regex = new RegExp(escapeRegex(q), 'i');
  const users = await User.find({ $or: [{ username: regex }, { name: regex }, { bio: regex }] })
    .select(LIST_FIELDS)
    .limit(limit)
    .lean();

  // Rank exact/prefix username matches first, then by popularity.
  const lower = q.toLowerCase();
  users.sort((a, b) => {
    const score = (u) => (u.username === lower ? 3 : u.username.startsWith(lower) ? 2 : u.name.toLowerCase().startsWith(lower) ? 1 : 0);
    return score(b) - score(a) || (b.followers?.length || 0) - (a.followers?.length || 0);
  });

  res.json({ users: users.map((u) => serialize.userCard(u, req.user)) });
});

/** GET /api/users/suggestions — popular users the current user does not follow yet. */
const getSuggestions = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5));
  const exclude = [req.user._id, ...(req.user.following || [])];

  const users = await User.aggregate([
    { $match: { _id: { $nin: exclude } } },
    { $addFields: { followersCount: { $size: { $ifNull: ['$followers', []] } } } },
    { $sort: { followersCount: -1, createdAt: -1 } },
    { $limit: limit },
    { $project: { name: 1, username: 1, profileImage: 1, bio: 1, followersCount: 1 } },
  ]);

  res.json({ users: users.map((u) => serialize.userCard(u, req.user)) });
});

/**
 * POST /api/users/:id/follow — follow a user.
 * Uses conditional atomic updates so duplicates are impossible even under concurrency.
 */
const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const me = req.user._id;

  if (String(targetId) === String(me)) throw ApiError.badRequest('You cannot follow yourself');

  const target = await User.findById(targetId).select('_id').lean();
  if (!target) throw ApiError.notFound('User not found');

  const result = await User.updateOne({ _id: targetId, followers: { $ne: me } }, { $addToSet: { followers: me } });
  await User.updateOne({ _id: me }, { $addToSet: { following: targetId } });

  if (result.modifiedCount > 0) {
    await createNotification({ recipient: targetId, sender: me, type: 'follow' });
  }

  res.json(await followState(targetId, me, true));
});

/** DELETE /api/users/:id/follow — unfollow a user. */
const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const me = req.user._id;

  if (String(targetId) === String(me)) throw ApiError.badRequest('You cannot unfollow yourself');

  const target = await User.findById(targetId).select('_id').lean();
  if (!target) throw ApiError.notFound('User not found');

  await User.updateOne({ _id: targetId }, { $pull: { followers: me } });
  await User.updateOne({ _id: me }, { $pull: { following: targetId } });
  await removeNotifications({ recipient: targetId, sender: me, type: 'follow' });

  res.json(await followState(targetId, me, false));
});

async function followState(targetId, meId, isFollowing) {
  const [target, me] = await Promise.all([
    User.findById(targetId).select('followers following').lean(),
    User.findById(meId).select('followers following').lean(),
  ]);
  return {
    userId: targetId,
    isFollowing,
    followersCount: target.followers.length,
    followingCount: target.following.length,
    me: { followersCount: me.followers.length, followingCount: me.following.length },
  };
}

/** GET /api/users/:username/followers and /following */
const listConnections = (field) =>
  asyncHandler(async (req, res) => {
    const username = String(req.params.username).toLowerCase();
    const user = await User.findOne({ username })
      .select(field)
      .populate({ path: field, select: LIST_FIELDS, options: { limit: 200 } })
      .lean();
    if (!user) throw ApiError.notFound('User not found');
    res.json({ users: (user[field] || []).map((u) => serialize.userCard(u, req.user)) });
  });

module.exports = {
  getUserByUsername,
  updateProfile,
  searchUsers,
  getSuggestions,
  followUser,
  unfollowUser,
  getFollowers: listConnections('followers'),
  getFollowing: listConnections('following'),
};
