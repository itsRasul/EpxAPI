const APIFeature = require('../utils/APIFeature');
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
  // FILTER:
  // filter means user pick only one or some records that have his expectation
  // for exmaple user wants to get a product that its name is 'myProduct' or price is more than 1000
  // he should query like this; /products?name='myProduct'&price[gt]=1000
  // req.query will be like: {name: ',myProduct', price: { gt : 1000 }}
  // we should turn it to like this: {name: 'myProduct', price: { $gt : 1000 }}
  // and query to DB => query.find({name: ',myProduct', price: { $gt : 1000 }})

  // SORT:
  // how to sort query: /users?sort=-name,+price,-test
  // - and + is triggered to ascending and deascending
  // how to use sort in mongoose: to sort results we use query.sort() method
  // using query.sort() has two ways: query.sort('+price -createdAt') Or .sort({price: 1, createdAt: -1})

  // IMPORTANT: query means User.find() => it return a query obj

  // SELECT:
  // how to query: /users?fields=name,email Or users?fields=-email
  // - means select all fields exclude that field
  // how to use select in mongoose: to selecting some special fields we use query.select() method
  // using qeury.select has two ways: query.select('-c -d') Or query.select({ a: 1, b: 1 });

  // PAGINATION:
  // in paginate recordes we need 3 property
  // 1. page 2. limit 3. skip
  // 1 and 2 come from queryString from client
  // but skip property we make it ourSelf based on page and limit prop
  // how to query: /users?page=2&limit=10
  // let skip = (page - 1) * limit;
  // how to query in mongoose:
  // query.skip(skip).limit(limit);
  const feature = new APIFeature(User.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limit()
    .fields();

  const users = await feature.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
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
      'this route is for updating non-sensitive data, if you wanna update user password please use this route => users/:id/updatePassword',
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
