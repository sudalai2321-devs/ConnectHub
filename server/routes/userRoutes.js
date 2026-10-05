const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validateMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

const profileRules = [
  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('bio').optional().isString().trim().isLength({ max: 160 }).withMessage('Bio cannot exceed 160 characters'),
  body('location').optional().isString().trim().isLength({ max: 50 }).withMessage('Location cannot exceed 50 characters'),
  body('removeImage').optional().isIn(['true', 'false', true, false]).withMessage('Invalid removeImage value'),
];

// Static paths must be declared before "/:username".
router.get('/search', ctrl.searchUsers);
router.get('/suggestions', ctrl.getSuggestions);
router.put('/profile', upload.single('profileImage'), profileRules, validate, ctrl.updateProfile);

router.post('/:id/follow', validateObjectId('id'), ctrl.followUser);
router.delete('/:id/follow', validateObjectId('id'), ctrl.unfollowUser);

router.get('/:username/followers', ctrl.getFollowers);
router.get('/:username/following', ctrl.getFollowing);
router.get('/:username', ctrl.getUserByUsername);

module.exports = router;
