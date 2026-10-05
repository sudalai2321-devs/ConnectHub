const express = require('express');
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', ctrl.getNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.put('/read-all', ctrl.markAllAsRead);
router.put('/:id/read', validateObjectId('id'), ctrl.markAsRead);

module.exports = router;
