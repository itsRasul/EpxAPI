const APIFeature = require('../utils/APIFeature');
const Exp = require('../models/expModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllExp = catchAsync(async (req, res, next) => {
  // get all exps
  const feature = new APIFeature(Exp.find(), req.query)
    .populate({ path: 'category' })
    .filter()
    .sort()
    .paginate()
    .limit()
    .fields();

  const exps = await feature.query;

  res.status(200).json({
    status: 'success',
    results: exps.length,
    data: {
      exps,
    },
  });
});

exports.getExp = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const exp = await Exp.findById(id);
  if (!exp) {
    throw new AppError('experience is not found!', 404);
  }

  exp.views = exp.views + 1;
  await exp.save();
  res.status(200).json({
    status: 'success',
    message: 'experiece found successfully!',
    data: {
      experience: exp,
    },
  });
});

exports.createExp = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const exp = await Exp.create(req.body);

  if (!exp) {
    throw new AppError('experience is not created, something went wrong!', 400);
  }

  res.status(201).json({
    status: 'success',
    message: 'new experience is created successfully!',
    data: {
      newExperience: exp,
    },
  });
});

exports.deleteExp = catchAsync(async (req, res, next) => {
  // this controller is for admin
  const { id } = req.params;
  const removedExp = await Exp.findByIdAndDelete(id);
  if (!removedExp) {
    throw new AppError(`experience doesn't exist, or already has been deleted!`);
  }
  res.status(204).json({
    status: 'success',
    message: 'experience is removed successfully!',
    data: {
      removedExp,
    },
  });
});

exports.updateExp = catchAsync(async (req, res, next) => {
  // this controller is for admin
  const { id } = req.params;
  const { experience, category } = req.body;
  const data = {
    experience,
    category,
  };

  const updatedExp = await Exp.findOneAndUpdate({ _id: id }, data);
  res.status(200).json({
    status: 'success',
    message: '',
    data: {
      updatedExp,
    },
  });
});

exports.deleteMyExp = catchAsync(async (req, res, next) => {
  // this controller is for all users
  const userId = req.user.id;
  const { id: expId } = req.params;

  const removedExp = await Exp.findOneAndDelete({ _id: expId, user: userId });

  if (!removedExp) {
    throw new AppError('there is no experience created with this id by you!', 404);
  }

  res.status(204).json({
    status: 'success',
    message: 'experience is deleted successfully!',
    data: {
      data: removedExp,
    },
  });
});

exports.updateMyExp = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id: expId } = req.params;

  const updatedExp = await Exp.findOneAndUpdate({ _id: expId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedExp) {
    throw new AppError('there is no experience created with this id by you!', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'your experience has been updated successfully!',
    data: {
      data: updatedExp,
    },
  });
});
