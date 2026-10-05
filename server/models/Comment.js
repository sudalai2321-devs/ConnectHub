const mongoose = require('mongoose');

const COMMENT_MAX_LENGTH = 300;

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
      maxlength: [COMMENT_MAX_LENGTH, `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`],
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });

commentSchema.statics.MAX_LENGTH = COMMENT_MAX_LENGTH;

module.exports = mongoose.model('Comment', commentSchema);
