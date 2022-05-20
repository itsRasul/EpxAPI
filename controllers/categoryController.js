const Category = require('../models/categoryModel');
const handlerFactory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');

exports.createCategory = handlerFactory.createOne(Category);
exports.getAllCategories = handlerFactory.getAll(Category);
exports.getCategory = handlerFactory.getOne(Category);
exports.deleteCategory = handlerFactory.deleteOne(Category);
exports.updateCategory = handlerFactory.updateOne(Category);
