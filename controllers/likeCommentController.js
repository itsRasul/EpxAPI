const LikeComment = require('../models/likeCommentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const handlerFactory = require('./handlerFactory');
const APIFeature = require('../utils/APIFeature');
const likeComment = require('../models/likeCommentModel');

exports.deleteMyLikeComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const like = await LikeComment.findOneAndDelete({ _id: id, user: req.user.id });

  res.status(204).json({
    status: 'success',
    message: 'your like is deleted successfully!',
    data: {
      like,
    },
  });
});

exports.createLikeComment = catchAsync(async (req, res, next) => {
  const data = {
    user: req.user.id,
    comment: req.params.commentId,
  };

  if (!data.comment) {
    throw new AppError(
      'please enter commentId in params in this format => /api/v1/comments/:commentId/likeComments',
      400
    );
  }

  const doc = await LikeComment.create(data);

  if (!doc) {
    throw new AppError('document is not created, something went wrong!', 400);
  }

  res.status(201).json({
    status: 'success',
    message: 'new document is created successfully!',
    data: {
      data: doc,
    },
  });
});

exports.getAllLikeComments = catchAsync(async (req, res, next) => {
  // this controller is for users to get all likes for one specific Exp AND for admin to recieive all likes in general
  // check if has user entered expId or not
  const { commentId } = req.params;

  if (commentId) {
    // user comes from this route => api/v1/exp/:expId/likes
    // so wants to receive all likes for a specefic exp
    const likes = await LikeComment.find({ comment: commentId }).sort('-createdAt').populate({
      path: 'user',
      select: 'userName photo',
    });

    res.status(200).json({
      status: 'success',
      results: likes.length,
      message: 'likes belongs to comment with this id was found successfully!',
      data: {
        data: likes,
      },
    });
  } else {
    // user comes from this route => api/v1/likes
    // so wants to get all likes in general
    // becuase these data can be sensitive, we check user must be admin to recieve these dadta
    if (req.user.role !== 'admin') {
      throw new AppError('you are forbbiden to access this route!', 403);
    }

    const feature = new APIFeature(LikeComment.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .limit()
      .fields();

    const likes = await feature.query;

    res.status(200).json({
      status: 'success',
      results: likes.length,
      message: 'all likes were found successfully!',
      data: {
        data: likes,
      },
    });
  }
});

exports.deleteLikeComment = catchAsync(async (req, res, next) => {
  // this controller is just for admin
  const { id } = req.params;
  const doc = await LikeComment.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    message: 'document is removed successfully!',
    data: {
      data: doc,
    },
  });
});

exports.getLikeComment = handlerFactory.getOne(likeComment, {
  path: 'user',
  select: 'userName photo',
});
