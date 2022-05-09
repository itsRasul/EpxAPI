const Exp = require('../models/expModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllExp = catchAsync(async (req, res, next) => {
  // get all exps

  const exps = res.status(200).send('this is get All Exp');
});

exports.getExp = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const exp = await Exp.findById(id);
  if (!exp) {
    throw new AppError('experience is not found!', 404);
  }
  res.status(200).json({
    status: 'success',
    message: 'experiece found successfully!',
    data: {
      experience: exp,
    },
  });
});

exports.createExp = catchAsync(async (req, res, next) => {
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
    experience: req.body.experience,
    category: req.body.category,
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
