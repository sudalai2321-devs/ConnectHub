const Notification = require('../models/Notification');

/**
 * Creates a notification. Never notifies users about their own actions.
 * For like/follow, any previous identical notification is replaced so
 * toggling repeatedly does not spam the recipient.
 * Notification failures are logged but never break the main action.
 */
async function createNotification({ recipient, sender, type, post = null, comment = null }) {
  try {
    if (!recipient || !sender || String(recipient) === String(sender)) return null;
    if (type === 'like' || type === 'follow') {
      await Notification.deleteMany({ recipient, sender, type, post });
    }
    return await Notification.create({ recipient, sender, type, post, comment });
  } catch (err) {
    console.error('Notification error:', err.message);
    return null;
  }
}

/** Removes notifications matching the filter (e.g. after unlike / unfollow / delete). */
async function removeNotifications(filter) {
  try {
    await Notification.deleteMany(filter);
  } catch (err) {
    console.error('Notification cleanup error:', err.message);
  }
}

module.exports = { createNotification, removeNotifications };
