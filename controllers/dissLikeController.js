const DissLike = require('../models/dissLikeModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.deleteMyDissLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const dissLike = await DissLike.findOneAndDelete({ _id: id, user: req.user.id });

  if (!dissLike) {
    throw new AppError("there is not disslike with this id, or it't not for you!", 404);
  }
  res.status(204).json({
    status: 'success',
    message: 'your diss like is deleted successfully!',
    data: {
      dissLike,
    },
  });
});

exports.createDissLike = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const doc = await DissLike.create(req.body);

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

exports.getAllDissLikes = handlerFactory.getAll(DissLike);
exports.getDissLike = handlerFactory.getOne(DissLike, {
  path: 'user',
  select: 'usermName photo',
});

// below controller is just for admin
exports.deleteDissLike = handlerFactory.deleteOne(DissLike);
