const mongoose = require('mongoose');
const Comment = require('../models/commentModel');
const AppError = require('../utils/AppError');

const likeCommentSchema = new mongoose.Schema({
  comment: {
    type: mongoose.Types.ObjectId,
    ref: 'Comment',
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// increase one likeComments to Comment model whenever user send a like for a comment
likeCommentSchema.statics.increaseLikesQuantity = async function (commentId, operation) {
  if (operation === 'plus') {
    await Comment.findByIdAndUpdate(
      commentId,
      {
        $inc: { likesQuantity: 1 },
      },
      {
        runValidators: true,
      }
    );
  } else if (operation === 'minus') {
    await Comment.findByIdAndUpdate(
      commentId,
      {
        $inc: { likesQuantity: -1 },
      },
      {
        runValidators: true,
      }
    );
  }
};

likeCommentSchema.pre('save', async function (next) {
  await this.constructor.increaseLikesQuantity(this.comment, 'plus');
  next();
});

likeCommentSchema.pre(/^findOneAndDelete/, async function (next) {
  this.currentLikeComment = await this.clone();

  if (!this.currentLikeComment) {
    return next(new AppError('likecomment is not exist, or is not created by you!', 404));
  }

  next();
});

likeCommentSchema.post(/^findOneAndDelete/, async function () {
  await this.currentLikeComment.constructor.increaseLikesQuantity(
    this.currentLikeComment.comment,
    'minus'
  );
});

const likeComment = mongoose.model('likeComment', likeCommentSchema);

module.exports = likeComment;
