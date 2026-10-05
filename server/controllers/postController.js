const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const serialize = require('../utils/serialize');
const { escapeRegex, extractTags, getPagination, deleteUploadedFile, fileToPublicPath } = require('../utils/helpers');
const { createNotification, removeNotifications } = require('../utils/notify');

const AUTHOR_FIELDS = 'name username profileImage';
const isId = (v) => mongoose.Types.ObjectId.isValid(v) && String(new mongoose.Types.ObjectId(v)) === String(v);

/** Runs a paginated post query and returns a serialized page. */
async function paginate(filter, req) {
  const { page, limit, skip } = getPagination(req.query, 10, 50);
  const docs = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit + 1) // fetch one extra to know if there is another page
    .populate('author', AUTHOR_FIELDS)
    .lean();

  const hasMore = docs.length > limit;
  const posts = docs
    .slice(0, limit)
    .filter((p) => p.author) // skip posts whose author was removed
    .map((p) => serialize.post(p, req.user._id));
  return { posts, page, limit, hasMore };
}

/**
 * GET /api/posts
 * Query: page, limit, feed=all|following, author=<userId>, likedBy=<userId>
 */
const getPosts = asyncHandler(async (req, res) => {
  const { feed, author, likedBy } = req.query;
  const filter = {};

  if (author) {
    if (!isId(author)) throw ApiError.badRequest('Invalid author ID');
    filter.author = author;
  } else if (likedBy) {
    if (!isId(likedBy)) throw ApiError.badRequest('Invalid user ID');
    filter.likes = likedBy;
  } else if (feed === 'following') {
    filter.author = { $in: [req.user._id, ...(req.user.following || [])] };
  }

  res.json(await paginate(filter, req));
});

/** GET /api/posts/search?q= — full-text-ish search on content, or by #hashtag. */
const searchPosts = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ posts: [], page: 1, hasMore: false });

  let filter;
  if (/^#[A-Za-z0-9_]+$/.test(q)) {
    filter = { tags: q.slice(1).toLowerCase() };
  } else {
    const regex = new RegExp(escapeRegex(q), 'i');
    // Also match posts by authors whose name/username matches.
    const authors = await User.find({ $or: [{ username: regex }, { name: regex }] }).select('_id').limit(20).lean();
    filter = { $or: [{ content: regex }, { author: { $in: authors.map((a) => a._id) } }] };
  }

  res.json(await paginate(filter, req));
});

/** GET /api/posts/trending — most used hashtags over the last 30 days (falls back to all-time). */
const getTrending = asyncHandler(async (req, res) => {
  const limit = Math.min(15, Math.max(1, parseInt(req.query.limit, 10) || 6));
  const pipeline = (match) => [
    { $match: match },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 }, likes: { $sum: { $size: { $ifNull: ['$likes', []] } } } } },
    { $sort: { count: -1, likes: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 0, tag: '$_id', count: 1, likes: 1 } },
  ];

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let trends = await Post.aggregate(pipeline({ createdAt: { $gte: since }, 'tags.0': { $exists: true } }));
  if (!trends.length) trends = await Post.aggregate(pipeline({ 'tags.0': { $exists: true } }));

  res.json({ trends });
});

/** POST /api/posts — create a post (multipart: content + optional image). */
const createPost = asyncHandler(async (req, res) => {
  const content = (req.body.content || '').trim();
  const image = fileToPublicPath(req.file);

  if (!content && !image) throw ApiError.badRequest('Post cannot be empty');

  const post = await Post.create({ author: req.user._id, content, image, tags: extractTags(content) });
  await post.populate('author', AUTHOR_FIELDS);

  res.status(201).json({ post: serialize.post(post.toObject(), req.user._id), message: 'Post published' });
});

/** GET /api/posts/:id */
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', AUTHOR_FIELDS).lean();
  if (!post || !post.author) throw ApiError.notFound('Post not found');
  res.json({ post: serialize.post(post, req.user._id) });
});

/** PUT /api/posts/:id — edit own post content. */
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  if (String(post.author) !== String(req.user._id)) throw ApiError.forbidden('You can only edit your own posts');

  const content = (req.body.content || '').trim();
  if (!content && !post.image) throw ApiError.badRequest('Post cannot be empty');

  post.content = content;
  post.tags = extractTags(content);
  post.editedAt = new Date();
  await post.save();
  await post.populate('author', AUTHOR_FIELDS);

  res.json({ post: serialize.post(post.toObject(), req.user._id), message: 'Post updated' });
});

/** DELETE /api/posts/:id — delete own post with its comments, notifications and image. */
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  if (String(post.author) !== String(req.user._id)) throw ApiError.forbidden('You can only delete your own posts');

  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    removeNotifications({ post: post._id }),
    post.deleteOne(),
  ]);
  deleteUploadedFile(post.image);

  res.json({ message: 'Post deleted', postId: post._id });
});

/**
 * POST /api/posts/:id/like
 * Conditional atomic update guarantees a user can like a post only once.
 */
const likePost = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const updated = await Post.findOneAndUpdate(
    { _id: req.params.id, likes: { $ne: me } },
    { $addToSet: { likes: me } },
    { new: true, timestamps: false }
  )
    .select('likes author')
    .lean();

  if (updated) {
    await createNotification({ recipient: updated.author, sender: me, type: 'like', post: updated._id });
    return res.json({ postId: updated._id, isLiked: true, likesCount: updated.likes.length });
  }

  // Either the post does not exist or it was already liked (idempotent).
  const existing = await Post.findById(req.params.id).select('likes').lean();
  if (!existing) throw ApiError.notFound('Post not found');
  res.json({ postId: existing._id, isLiked: true, likesCount: existing.likes.length });
});

/** DELETE /api/posts/:id/like */
const unlikePost = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const updated = await Post.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { likes: me } },
    { new: true, timestamps: false }
  )
    .select('likes author')
    .lean();

  if (!updated) throw ApiError.notFound('Post not found');
  await removeNotifications({ recipient: updated.author, sender: me, type: 'like', post: updated._id });

  res.json({ postId: updated._id, isLiked: false, likesCount: updated.likes.length });
});

module.exports = {
  getPosts,
  searchPosts,
  getTrending,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
};
