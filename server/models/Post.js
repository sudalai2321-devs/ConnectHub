const mongoose = require('mongoose');

const POST_MAX_LENGTH = 500;

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
      type: String,
      trim: true,
      default: '',
      maxlength: [POST_MAX_LENGTH, `Post cannot exceed ${POST_MAX_LENGTH} characters`],
    },
    image: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Denormalised counter kept in sync by the comment controller (avoids a count query per post).
    commentsCount: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, lowercase: true, trim: true }],
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

postSchema.pre('validate', function ensureNotEmpty(next) {
  if (!this.content && !this.image) {
    this.invalidate('content', 'Post cannot be empty');
  }
  next();
});

postSchema.index({ createdAt: -1, _id: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1, createdAt: -1 });
postSchema.index({ likes: 1 });

postSchema.statics.MAX_LENGTH = POST_MAX_LENGTH;

module.exports = mongoose.model('Post', postSchema);
