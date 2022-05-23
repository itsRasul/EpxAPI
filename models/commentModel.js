const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

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
    likesQuantity: {
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

commentSchema.statics.increaseRepliesQuantity = async function (
  parrentCommentId,
  Model,
  operation
) {
  if (operation === 'plus') {
    await Model.findByIdAndUpdate(
      parrentCommentId,
      {
        $inc: { repliesQuantity: 1 },
      },
      {
        runValidators: true,
      }
    );
  } else if (operation === 'minus') {
    await Model.findByIdAndUpdate(
      parrentCommentId,
      {
        $inc: { repliesQuantity: -1 },
      },
      {
        runValidators: true,
      }
    );
  }
};

// always populate user
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'photo userName',
  });
  next();
});

// whenever user replies to a comment we incerease one to repliesQuantity to parentComment
commentSchema.pre('save', async function (next) {
  // this => current comment
  // this.constructor => Model (Comment)
  if (!this.parentComment) {
    return next();
  }
  await this.constructor.increaseRepliesQuantity(this.parentComment, this.constructor, 'plus');
  next();
});

commentSchema.pre(/^findOneAndDelete/, async function (next) {
  // this => query
  this.currentComment = await this.clone();

  if (!this.currentComment) {
    return next(new AppError('comment is not exist, or is not created by you!', 404));
  }
  next();
});

commentSchema.post(/^findOneAndDelete/, async function () {
  // this => query
  // this.currentComment => comment Doc
  // this.currentComment.constructor => Model (Comment)
  await this.currentComment.constructor.increaseRepliesQuantity(
    this.currentComment.parentComment,
    this.currentComment.constructor,
    'minus'
  );
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
