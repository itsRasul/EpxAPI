const DissLike = require('../models/dissLikeModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const APIFeature = require('../utils/APIFeature');

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
  const data = {
    user: req.user.id,
    exp: req.params.expId,
  };

  if (!data.exp) {
    throw new AppError(
      'please enter expId in params in this format => /api/v1/exps/:expId/disslikes',
      400
    );
  }

  const doc = await DissLike.create(data);

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

exports.getAllDissLikes = catchAsync(async (req, res, next) => {
  // this controller is for users to get all likes for one specific Exp (Not all likes in general)
  // check if has user entered expId or not
  const { expId } = req.params;

  if (expId) {
    // user comes from this route => api/v1/exp/:expId/disslikes
    // so wants to receive all disslikes for a specefic exp
    const dissLikes = await DissLike.find({ exp: expId }).sort('-createdAt').populate({
      path: 'user',
      select: 'userName photo',
    });

    res.status(200).json({
      status: 'success',
      results: dissLikes.length,
      message: 'dissLikes belongs to experience with this id was found successfully!',
      data: {
        data: dissLikes,
      },
    });
  } else {
    // user comes from this route => api/v1/disslikes
    // so wants to get all disslikes in general
    if (req.user.role !== 'admin') {
      throw new AppError('you are forbbiden to access this route!', 403);
    }

    const feature = new APIFeature(DissLike.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .limit()
      .fields();

    const dissLikes = await feature.query;

    res.status(200).json({
      status: 'success',
      results: dissLikes.length,
      message: 'all diss likes were found successfully!',
      data: {
        data: dissLikes,
      },
    });
  }
});

exports.getDissLike = handlerFactory.getOne(DissLike, {
  path: 'user',
  select: 'usermName photo',
});

// below controller is just for admin
exports.deleteDissLike = handlerFactory.deleteOne(DissLike);
