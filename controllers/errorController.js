const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const { message } = err;
  return new AppError(message, 400);
};

const handleDublicateFieldDB = err => {
  const message = `dublicate field value: "${
    Object.keys(err.keyValue)[0]
  }" please try another value`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('The Token is Invalid, please log in again!', 401);

const handleExpiredToken = () => new AppError('The Token is expired, please login again!', 401);

const limitUnexpectedFileError = () =>
  new AppError('you have uploaded more than number we expected!', 400);

const sendErrorDev = (err, req, res) => {
  // WE ARE IN API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    //WE ARE IN RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'Error',
      msg: err.message,
    });
  }
  console.log('Error: ', err);
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // WE ARE IN API
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // this error is related to programming problme, so we are not gonna show
      // all the details to client

      // 1) Log Error to console
      console.error(`Error: ${err}`);

      // 2) send a thin message just to show somthing went wrong(not details)
      res.status(500).json({
        status: 'error',
        message: 'Oops, somthing went wrong!',
      });
    }
  }
  // WE ARE IN RENDERED WEBSITE
  else if (err.isOperational) {
    // we made this error ourself with specific message by AppError
    res.status(err.statusCode).render('error', {
      title: 'Error',
      msg: err.message,
    });
  } else {
    // this error is related to programming problme, so we are not gonna show
    // all the details to client

    // 1) Log Error to console
    console.log('Error:', err);

    // 2) send a thin message just to show somthing went wrong(not details)
    res.status(500).render('error', {
      title: 'Error',
      msg: 'please try again later!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // here is where we're gonna handle all the Error (operational Error)
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    // error.__proto__ = err.__proto__;
    Object.setPrototypeOf(error, Object.getPrototypeOf(err));
    error.message = err.message;
    // meaning of these if else statements is we wanna make error operational by ourself using AppError

    // when user tries to get a Tour by whole wrong id this error will be occured that err.name is CastError
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    // when user tries to update a source that has wrong field value
    //  and validators throws Error, err.name is ValidationError
    else if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    // when user tries create a tour that has dublicate field err.code is 11000
    else if (err.code === 11000) error = handleDublicateFieldDB(error);
    // when jwt.verify() makes error, thats name is JsonWebTokenError, it's  related to verifying (not match signitures together, manipulated payload in Token)
    else if (err.name === 'JsonWebTokenError') error = handleJWTError();
    // when Token is Expired jwt.verify func throw an Error with name is TokenExpiredError
    else if (err.name === 'TokenExpiredError') error = handleExpiredToken();
    // if user upload multiple files and we have a limit for that, throws an error that err.code is LIMIT_UNEXPECTED_FILE
    else if (err.code === 'LIMIT_UNEXPECTED_FILE') error = limitUnexpectedFileError();

    sendErrorProd(error, req, res);
  }
};
