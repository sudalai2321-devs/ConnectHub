const express = require('express');
const { body } = require('express-validator');
const posts = require('../controllers/postController');
const comments = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validateMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const router = express.Router();

router.use(protect);

const contentRule = body('content')
  .optional({ values: 'null' })
  .isString().withMessage('Content must be text')
  .trim()
  .isLength({ max: Post.MAX_LENGTH }).withMessage(`Post cannot exceed ${Post.MAX_LENGTH} characters`);

const commentRule = body('content')
  .isString().withMessage('Comment cannot be empty')
  .trim()
  .notEmpty().withMessage('Comment cannot be empty')
  .isLength({ max: Comment.MAX_LENGTH }).withMessage(`Comment cannot exceed ${Comment.MAX_LENGTH} characters`);

const id = validateObjectId('id');

router.get('/', posts.getPosts);
router.post('/', upload.single('image'), contentRule, validate, posts.createPost);
router.get('/search', posts.searchPosts);
router.get('/trending', posts.getTrending);

router.get('/:id', id, posts.getPost);
router.put('/:id', id, contentRule, validate, posts.updatePost);
router.delete('/:id', id, posts.deletePost);

router.post('/:id/like', id, posts.likePost);
router.delete('/:id/like', id, posts.unlikePost);

router.get('/:id/comments', id, comments.getComments);
router.post('/:id/comments', id, commentRule, validate, comments.addComment);

module.exports = router;
