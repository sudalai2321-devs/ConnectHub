const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validateMiddleware');
const Message = require('../models/Message');

const router = express.Router();

router.use(protect);

router.get('/conversations', ctrl.getConversations);
router.get('/unread-count', ctrl.getUnreadCount);
router.get('/:userId', validateObjectId('userId'), ctrl.getThread);
router.post(
  '/:userId',
  validateObjectId('userId'),
  body('content')
    .isString().withMessage('Message cannot be empty')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: Message.MAX_LENGTH }).withMessage(`Message cannot exceed ${Message.MAX_LENGTH} characters`),
  validate,
  ctrl.sendMessage
);

module.exports = router;
