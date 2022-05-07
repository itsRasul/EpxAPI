const Exp = require('../models/expModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllExp = catchAsync(async (req, res, next) => {
	// get all exps

	const exps = res.status(200).send('this is get All Exp');
});

exports.getExp = catchAsync(async (req, res, next) => {
	res.status(200).send('this is get Exp');
});

exports.createExp = catchAsync(async (req, res, next) => {
	res.status(200).send('this is create Exp');
});

exports.deleteExp = catchAsync(async (req, res, next) => {
	res.status(200).send('this is delete Exp');
});

exports.updateExp = catchAsync(async (req, res, next) => {
	res.status(200).send('this is update Exp');
});
