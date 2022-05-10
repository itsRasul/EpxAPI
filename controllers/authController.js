const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const createAndSendToken = (user, res, statusCode, message) => {
  // so user is exist and password is correct, now it's time to create new token and send it back to the client!
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  const cookieOptions = {
    // expiresIn should be in milieSecond
    // when a cookie is expired, cookie automaticlly will be removed by browser, and can't to send it back in feature requests
    expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    // httpOnly: when httpOnly is true, js in client doesn't access to cookie and can't be manipulated by anyone
    // just browser store it and send it back(nothing else)... this prevents to some XSS atacks
    httpOnly: true,
    // secure: when secure is true, the cookie just will be sent in https protocol,
    // to be sure that cookie will not be accessable by anyone in network and security terms
    // just secure should be true in production envirement, because in dev envirement we are not work ot HTTPS, but HTTP
    // secure: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const data = {
    name: req.body.name,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  const newUser = await User.create(data);

  createAndSendToken(newUser, res, 201, 'you are signed up successfully!');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('please enter your email and password!', 400);
  }

  // check if user is exist
  const user = await User.findOne({ email }).select('+password');
  // compare the passwords
  if (!user || !(await user.comparePassword(password, user.password))) {
    throw new AppError('email or password is incorrect!', 400);
  }

  createAndSendToken(user, res, 200, 'you are logged in successfully!');
});
// the second part of authentication (after login and creating token and send it to user client) is protect middleware
// where we verify the token has recieved in protected route
exports.protect = catchAsync(async (req, res, next) => {
  // 1) check if token is exist and it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookie.jwt) {
    token = req.cookie.jwt;
  }

  if (!token) {
    throw new AppError('you have not logged in, please log in and try again!', 401);
  }

  // 2) check if token is valid
  // if it's valid the resolved value (deacodedToken) will be payload of jwt token
  // which is contains { id: 584dsd654165, iat: 13999494594, exp: 13999494594 }
  // and if it's not valid throws an error that end function executioan
  const deacodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user is still exist
  const user = await User.findById(deacodedToken.id).select('+password');

  if (!user) {
    throw new AppError('user recently deleted his account, please login again!', 401);
  }
  // 4) check if user hasn't change his password after the token was issued
  // beacuse for example a user's token has stolen by a hacker and the user to prevent it changes his password
  // so we should invalid the pre token

  if (user.changedPasswordAfterTokenIssued(deacodedToken.iat)) {
    throw new AppError('user recently changed password, please login again!', 401);
  }

  // everything is Ok, take user to next middleware
  req.user = user;
  next();
});

exports.reStrictTo = function (...roles) {
  // ...roles will be like: ['admin', 'user']
  // if users's role is the same go to next middleware
  // if user's role is not properiate throw an Error
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('you are forbidden to access this route!', 403));
    }
    next();
  };
};
