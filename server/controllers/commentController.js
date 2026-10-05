const Comment = require('../models/Comment');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const serialize = require('../utils/serialize');
const { createNotification, removeNotifications } = require('../utils/notify');

const AUTHOR_FIELDS = 'name username profileImage';

/** GET /api/posts/:id/comments — oldest first. */
const getComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).select('_id commentsCount').lean();
  if (!post) throw ApiError.notFound('Post not found');

  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 100));
  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('author', AUTHOR_FIELDS)
    .lean();

  res.json({
    comments: comments.filter((c) => c.author).map((c) => serialize.comment(c, req.user._id)),
    commentsCount: post.commentsCount,
  });
});

/** POST /api/posts/:id/comments */
const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).select('_id author').lean();
  if (!post) throw ApiError.notFound('Post not found');

  const comment = await Comment.create({ post: post._id, author: req.user._id, content: req.body.content });
  const updated = await Post.findByIdAndUpdate(
    post._id,
    { $inc: { commentsCount: 1 } },
    { new: true, timestamps: false }
  )
    .select('commentsCount')
    .lean();

  await comment.populate('author', AUTHOR_FIELDS);
  await createNotification({
    recipient: post.author,
    sender: req.user._id,
    type: 'comment',
    post: post._id,
    comment: comment._id,
  });

  res.status(201).json({
    comment: serialize.comment(comment.toObject(), req.user._id),
    commentsCount: updated ? updated.commentsCount : 0,
    message: 'Comment added',
  });
});

/** DELETE /api/comments/:id — only the comment author may delete it. */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (String(comment.author) !== String(req.user._id)) {
    throw ApiError.forbidden('You can only delete your own comments');
  }

  await comment.deleteOne();
  const updated = await Post.findOneAndUpdate(
    { _id: comment.post, commentsCount: { $gt: 0 } },
    { $inc: { commentsCount: -1 } },
    { new: true, timestamps: false }
  )
    .select('commentsCount')
    .lean();
  await removeNotifications({ comment: comment._id });

  res.json({
    message: 'Comment deleted',
    commentId: comment._id,
    postId: comment.post,
    commentsCount: updated ? updated.commentsCount : 0,
  });
});

module.exports = { getComments, addComment, deleteComment };
