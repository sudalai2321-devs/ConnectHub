const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const serialize = require('../utils/serialize');

/** GET /api/messages/conversations — latest message per conversation partner. */
const getConversations = asyncHandler(async (req, res) => {
  const me = new mongoose.Types.ObjectId(String(req.user._id));

  const rows = await Message.aggregate([
    { $match: { $or: [{ sender: me }, { recipient: me }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $cond: [{ $eq: ['$sender', me] }, '$recipient', '$sender'] },
        lastMessage: { $first: '$$ROOT' },
        unread: { $sum: { $cond: [{ $and: [{ $eq: ['$recipient', me] }, { $eq: ['$read', false] }] }, 1, 0] } },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $limit: 50 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
  ]);

  res.json({
    conversations: rows.map((r) => ({
      user: serialize.publicUser(r.user),
      lastMessage: serialize.message(r.lastMessage, req.user._id),
      unread: r.unread,
    })),
  });
});

/** GET /api/messages/unread-count */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({ recipient: req.user._id, read: false });
  res.json({ count });
});

/** GET /api/messages/:userId?after=<ISO date> — conversation thread; marks incoming as read. */
const getThread = asyncHandler(async (req, res) => {
  const other = await User.findById(req.params.userId).select('name username profileImage bio').lean();
  if (!other) throw ApiError.notFound('User not found');

  const me = req.user._id;
  const filter = {
    $or: [
      { sender: me, recipient: other._id },
      { sender: other._id, recipient: me },
    ],
  };
  if (req.query.after) {
    const after = new Date(req.query.after);
    if (!Number.isNaN(after.getTime())) filter.createdAt = { $gt: after };
  }

  const messages = (await Message.find(filter).sort({ createdAt: -1 }).limit(100).lean()).reverse();
  await Message.updateMany({ sender: other._id, recipient: me, read: false }, { read: true });

  res.json({ user: serialize.publicUser(other), messages: messages.map((m) => serialize.message(m, me)) });
});

/** POST /api/messages/:userId */
const sendMessage = asyncHandler(async (req, res) => {
  if (String(req.params.userId) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot message yourself');
  }
  const recipient = await User.findById(req.params.userId).select('_id').lean();
  if (!recipient) throw ApiError.notFound('User not found');

  const message = await Message.create({ sender: req.user._id, recipient: recipient._id, content: req.body.content });
  res.status(201).json({ message: serialize.message(message.toObject(), req.user._id) });
});

module.exports = { getConversations, getUnreadCount, getThread, sendMessage };
