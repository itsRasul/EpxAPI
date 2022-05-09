const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('user is not exist!', 404);
  }
  res.status(200).json({
    status: 'success',
    message: 'user have been found successfully!',
    data: {
      user,
    },
  });
});
exports.getAllUser = catchAsync(async (req, res, next) => {});
exports.createUser = catchAsync(async (req, res, next) => {
  const data = {
    name: req.body.name,
    userName: req.body.userName,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    email: req.body.email,
  };

  const newUser = await User.create(data);

  if (!newUser) {
    throw new AppError('user is not created successfully, something went wrong!', 400);
  }

  res.status(201).json({
    status: 'success',
    message: 'user is created successfully!',
    data: {
      newUser,
    },
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {});
exports.updateUser = catchAsync(async (req, res, next) => {});
