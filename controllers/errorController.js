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

function sendErrorDev(err, req, res) {
	if (req.originalUrl.startsWith('/api')) {
		// we are in API
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			error: err,
			stack: err.stack,
		});
	} else {
		// we are in rendered website
		res.status(err.statusCode).render('error', {
			title: 'error',
			errorMsg: err.message,
		});
	}
	console.log('Error: ', err);
}

function sendErrorProd(err, req, res) {
	if (req.originalUrl.startsWith('/api')) {
		// WE ARE IN API
		if (err.isOperational) {
			// error is Operational, so we can send back message to the user because ourself made this message
			res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		} else {
			// error is not Operational, so we can't actually send back the info about error, because maybe it contains a security bug
			// and user shouln't find about this, besides on that, user can't understand what's going on because he is not programmer
			// so we should just send back a thin message
			// point: we didn't make this error so we can't access to err.status or err.statusCode, these are just in AppError(but in module.exports
			// we've just assingned err.status and err.statusCode to 'error' and '500' in case the error wasn't operational)
			res.status(err.statusCode).json({
				status: err.status,
				message: 'Oops, somthing went wrong!',
			});
		}
	} else {
		// WE ARE IN RENDERED WEBSITE
		if (err.isOperational) {
			// error is Operational
			res.status(err.statusCode).render('error', {
				title: 'error',
				errorMsg: err.message,
			});
		} else {
			// error is not operational, so we can't send back info about error, just send a regular message
			res.status(err.statusCode).render('error', {
				title: 'error',
				errorMsg: 'somthing went wrong, please try again later!',
			});
		}
	}
	// anyway, log the Error in all of Possibilities
	console.log('Error: ', err);
}

module.exports = (err, req, res, next) => {
	err.status = err.status || 'error';
	err.statusCode = err.statusCode || 500;
	if (process.env.NDOE_ENV === 'development') {
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

		sendErrorProd(error, req, res);
	}
};
