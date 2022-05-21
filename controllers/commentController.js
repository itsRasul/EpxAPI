const Comment = require('../models/commentModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeature = require('../utils/APIFeature');
const handlerFactory = require('./handlerFactory');

exports.createComment = catchAsync(async (req, res, next) => {
  if (!req.params.expId) {
    throw new AppError(
      'please enter expId in params in this format => /api/v1/exps/:expId/comments',
      400
    );
  }
  const data = {
    user: req.user.id,
    exp: req.params.expId,
    content: req.body.content,
    parentComment: req.body.parentComment,
  };

  const comment = await Comment.create(data);

  res.status(201).json({
    status: 'success',
    message: 'your comment was sent!',
    data: {
      data: comment,
    },
  });
});
exports.getAllComments = catchAsync(async (req, res, next) => {
  // admin wants to get All comments in general => /api/v1/comments
  // user wants to get All comments for a specific exp => /api/v1/exp/:expId/comments

  const { expId } = req.params;

  if (expId) {
    // get all comments for a specific exp (comments level 1)
    const feature = new APIFeature(Comment.find({ exp: expId, parentComment: null }), req.query)
      .filter()
      .sort()
      .paginate()
      .limit()
      .fields();

    const comments = await feature.query.populate({ path: 'user', select: 'userName photo' });

    res.status(200).json({
      status: 'success',
      results: comments.length,
      meesage: 'all comments for this exp are recieved successfully!',
      data: {
        data: comments,
      },
    });
  } else {
    // admin wants to get all comments i generall

    if (req.user.role !== 'admin') {
      throw new AppError('you are forbbiden to access this route!', 403);
    }

    const feature = new APIFeature(Comment.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .limit()
      .fields();

    const comments = await feature.query;

    res.status(200).json({
      status: 'success',
      results: comments.length,
      message: 'all comments are recieved successfully!',
      data: {
        data: comments,
      },
    });
  }
});

exports.deleteMyComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findOneAndDelete({ id: req.params.id, user: req.user.id });

  if (!comment) {
    throw new AppError('comment is not exist, or is not created by you!', 404);
  }

  res.status(204).json({
    status: 'success',
    meesage: 'comment is deleted successfully!',
    data: {
      data: comment,
    },
  });
});

exports.updateMyComment = catchAsync(async (req, res, next) => {
  // user can only able to update the content of comment

  const comment = await Comment.findOneAndUpdate(
    { id: req.params.id, user: req.user.id },
    { content: req.body.content },
    { new: true, runValidators: true }
  );

  if (!comment) {
    throw new AppError('comment is not exist, or is not created by you!', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'your comment has been updated successfully!',
    data: {
      data: comment,
    },
  });
});

exports.getComment = handlerFactory.getOne(Comment, {
  path: 'user',
  select: 'userName photo',
});
// these below controllers is just for admin
exports.deleteComment = handlerFactory.deleteOne(Comment);
exports.updateComment = handlerFactory.updateOne(Comment);
