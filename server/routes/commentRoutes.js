const express = require('express');
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateMiddleware');

const router = express.Router();

router.delete('/:id', protect, validateObjectId('id'), deleteComment);

module.exports = router;
