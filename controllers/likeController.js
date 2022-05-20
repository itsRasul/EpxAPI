const Like = require('../models/likeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const handlerFactory = require('./handlerFactory');
const APIFeature = require('../utils/APIFeature');

exports.deleteMyLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const like = await Like.findOneAndDelete({ _id: id, user: req.user.id });

  if (!like) {
    throw new AppError('there is no like on this experience by you!', 404);
  }

  res.status(204).json({
    status: 'success',
    message: 'your like is deleted successfully!',
    data: {
      like,
    },
  });
});

exports.createLike = catchAsync(async (req, res, next) => {
  const data = {
    user: req.user.id,
    exp: req.params.expId,
  };

  if (!data.exp) {
    throw new AppError(
      'please enter expId in params in this format => /api/v1/exps/:expId/likes',
      400
    );
  }

  const doc = await Like.create(data);

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

exports.getAllLikes = catchAsync(async (req, res, next) => {
  // this controller is for users to get all likes for one specific Exp AND for admin to recieive all likes in general
  // check if has user entered expId or not
  const { expId } = req.params;

  if (expId) {
    // user comes from this route => api/v1/exp/:expId/likes
    // so wants to receive all likes for a specefic exp
    const likes = await Like.find({ exp: expId }).sort('-createdAt').populate({
      path: 'user',
      select: 'userName photo',
    });

    res.status(200).json({
      status: 'success',
      results: likes.length,
      message: 'likes belongs to experience with this id was found successfully!',
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

    const feature = new APIFeature(Like.find(), req.query)
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

exports.getLike = handlerFactory.getOne(Like, { path: 'user', select: 'userName photo' });
// below controller is just for admin
exports.deleteLike = handlerFactory.deleteOne(Like);
