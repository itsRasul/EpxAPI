const multer = require('multer');
const sharp = require('sharp');
const APIFeature = require('../utils/APIFeature');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const filterField = (body, ...data) => {
  let newObj = {};
  // iterate in body, take every field into newObj if it's in data array
  // this returns a object that has only fields which is in ...data array
  Object.keys(body).forEach(field => {
    if (data.includes(field)) {
      newObj[field] = body[field];
    }
  });
  return newObj;
};

const update = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.split('/')[0] == 'image') {
      cb(null, true);
    } else {
      cb(new AppError('file must only be an image!', 400), false);
    }
  },
});

exports.updateUserPhoto = update.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  const extension = req.file.mimetype.split('/')[1];
  req.file.fileName = `user-${req.user.id}-${Date.now()}.${extension}`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.fileName}`);
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // this route is for user can update his non-sensitive data by himself
  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError(
      `you can't update your password in this route, if you wanna change your password please go in this route: /users/:id/updateMyPassword`
    );
  }

  const filteredFields = filterField(req.body, 'name', 'email', 'userName');
  if (req.file) filteredFields.photo = req.file.fileName;
  // top code and bottom code are doing exact same thing
  // const data = {
  //   name: req.body.name || req.user.name,
  //   email: req.body.email || req.user.email,
  //   userName: req.body.userName || req.user.userName,
  // };

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'user is updated successfully!',
    data: {
      user: updatedUser,
    },
  });
});

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

  newUser.password = undefined;

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

  const user = await User.findById(id).select('+password');

  if (!user) {
    throw new AppError('user is not exist!', 404);
  }
  // to avoiding one bug in pre middleware: we should avoid user to save a newPassword that is the same current password
  if (await user.comparePassword(password, user.password)) {
    // pre password and new password are the same, we don't wannna it.
    throw new AppError('please use a new password which you have not used before!', 400);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'user password is updated successfully!',
    data: {
      user,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  // retrun user data except password
  const user = await User.findById(req.user.id).select(
    '-password -passwordConfirm -passwordChangedAt -resetPassword -resetPasswordExpires -__V'
  );

  if (!user) throw new AppError('user is not exist!', 404);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// test uploading video

// const uploadVideoMulter = multer({
//   storage: multer.diskStorage({
//     // this func specify where files are gonna be stored
//     destination: (req, file, cb) => {
//       // cb stands for callback, it's somthing like next() in express, if there is an error put that error into the first argument, otherhands put null
//       // in second argument put actully value, and when cb is called, it's gonna to run next func
//       cb(null, 'public/videos');
//     },
//     filename: (req, file, cb) => {
//       const extension = file.mimetype.split('/')[1]; // returns passvand file ex) jpeg, png
//       // we wanna name the file like this => user-userId-timeStamp.extension => user-68f4sd1f68sd-35468516185.jpeg
//       cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     console.log({ file });
//     if (file.mimetype.split('/')[0] == 'video') {
//       cb(null, true);
//     } else {
//       cb(new AppError('please upload a video', 400), false);
//     }
//   },
// });

// exports.uploadVideo = uploadVideoMulter.single('videos');

// exports.uploadVideoHandler = (req, res, next) => {
//   res.send('upload was success!');
// };
