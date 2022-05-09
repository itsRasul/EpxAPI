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
    message: 'user has been found successfully!',
    data: {
      user,
    },
  });
});
exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
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

exports.deleteUser = catchAsync(async (req, res, next) => {
  // this controller is for admin to remove a user
  const { id } = req.params;
  const removedUser = await User.findByIdAndDelete(id);

  if (!removedUser) {
    throw new AppError('user is not exist!', 404);
  }

  res.status(204).json({
    status: 'success',
    message: 'users is deleted successfully!',
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // this controller for admin to update non-sensitive data of a user
  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError(
      'this route is for updating non-sensitive data, if you wanna update user password please users/:id/updatePassword',
      400
    );
  }

  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('user is not exist!', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'user is updated successfully!',
    data: {
      user,
    },
  });
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
  // this route is for admin to update a user password (sensitive data)
  const { password, passwordConfirm } = req.body;
  const { id } = req.params;
  if (!password || !passwordConfirm) {
    throw new AppError('please enter password and password Confirm!');
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError('user is not exist!', 404);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'user password is updated successfully!',
    data: {
      user,
    },
  });
});
