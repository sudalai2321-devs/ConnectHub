const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const serialize = require('../utils/serialize');
const { getPagination } = require('../utils/helpers');

/** GET /api/notifications?page=&limit=&unread=true */
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20, 50);
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.read = false;

  const [docs, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .populate('sender', 'name username profileImage')
      .populate('post', 'content image')
      .populate('comment', 'content')
      .lean(),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);

  const hasMore = docs.length > limit;
  const notifications = docs
    .slice(0, limit)
    .filter((n) => n.sender && (n.type === 'follow' || n.post))
    .map(serialize.notification);

  res.json({ notifications, unreadCount, page, hasMore });
});

/** GET /api/notifications/unread-count — lightweight endpoint for the nav badge. */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
  res.json({ count });
});

/** PUT /api/notifications/:id/read — users can only mark their own notifications. */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  ).lean();
  if (!notification) throw ApiError.notFound('Notification not found');

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  res.json({ notificationId: notification._id, read: true, unreadCount });
});

/** PUT /api/notifications/read-all */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ updated: result.modifiedCount, unreadCount: 0 });
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
