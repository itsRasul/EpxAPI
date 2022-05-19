const Like = require('../models/likeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const handlerFactory = require('./handlerFactory');

exports.deleteMyLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const like = await Like.findOneAndDelete({ _id: id, user: req.user.id });

  res.status(204).json({
    status: 'success',
    message: 'your like is deleted successfully!',
    data: {
      like,
    },
  });
});

exports.createLike = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const doc = await Like.create(req.body);

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

exports.getLike = handlerFactory.getOne(Like, { path: 'user', select: 'userName photo' });
exports.getAllLikes = handlerFactory.getAll(Like);
// below controller is just for admin
exports.deleteLike = handlerFactory.deleteOne(Like);
