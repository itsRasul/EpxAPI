const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'comment must belongs to a user!'],
    },
    exp: {
      type: mongoose.Types.ObjectId,
      ref: 'Exp',
      required: [true, 'comment must belongs to a experience!'],
    },
    content: {
      type: String,
      maxlength: [280, 'comment must be less than 280 charecter'],
      required: [true, 'comment must have a content'],
    },
    parentComment: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    repliesQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
