const Mark = require('../models/markModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/AppError');
const APIFeature = require('../utils/APIFeature');

exports.createMark = catchAsync(async (req, res, next) => {
  // user comes from this route => api/v1/exps/:expId/marks
  const { id: userId } = req.user;
  const { expId } = req.params;

  if (!expId) {
    throw new AppError(
      'please enter experience id in this format => /api/v1/exps/:expId/marks',
      400
    );
  }

  const mark = await Mark.create({
    user: userId,
    exp: expId,
  });

  res.status(201).json({
    status: 'success',
    message: 'mark is added into your profile successfully!',
    data: {
      data: mark,
    },
  });
});

exports.getMyMarks = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  const feature = new APIFeature(Mark.find({ user: userId }), req.query)
    .filter()
    .sort()
    .paginate()
    .limit()
    .fields();

  const marks = await feature.query
    .populate({
      path: 'user',
      select: 'userName photo',
    })
    .populate({
      path: 'exp',
    });

  res.status(200).json({
    status: 'success',
    results: marks.length,
    message: 'your marks have been successfully found!',
    data: {
      data: marks,
    },
  });
});

exports.deleteMyMark = catchAsync(async (req, res, next) => {
  // api/v1/marks/:id/deleteMyMark
  const { id: userId } = req.user;
  const { id: markId } = req.params;

  const mark = await Mark.findOneAndDelete({ user: userId, _id: markId });

  res.status(204).json({
    status: 'success',
    message: 'mark has been deleted successfully!',
    data: {
      data: mark,
    },
  });
});

exports.deleteMark = handlerFactory.deleteOne(Mark);
exports.getMark = handlerFactory.getOne(Mark);
// exports.getAllMarks = handlerFactory.getAll(
//   Mark,
//   { path: 'user', select: 'userName photo' },
//   { path: 'exp' }
// );

exports.getAllMarks = catchAsync(async (req, res, next) => {
  // this route is for admin in two ways:
  // admin send a get req to this route => api/v1/marks => admin wants to get all the marks in general
  // admin send a get req to this route => api/v1/exps/:expId/marks => admin wants all marks for a specific exp
  const { expId } = req.params;

  if (expId) {
    // admin wants to get all marks for an specific exp
    const marks = await Mark.find({ exp: expId })
      .populate({
        path: 'user',
        select: 'userName photo',
      })
      .populate({
        path: 'exp',
      });

    res.status(200).json({
      status: 'success',
      message: 'marks are recieved successfully!',
      data: {
        data: marks,
      },
    });
  } else {
    // admin wants get all marks in genral
    const feature = new APIFeature(Mark.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .limit()
      .fields();

    const marks = await feature.query
      .populate({
        path: 'user',
        select: 'userName photo',
      })
      .populate({
        path: 'exp',
        select: 'name experience',
      });

    res.status(200).json({
      status: 'success',
      message: 'marks are recieved successfully!',
      data: {
        data: marks,
      },
    });
  }
});
