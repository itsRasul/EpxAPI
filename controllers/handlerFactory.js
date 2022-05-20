const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeature = require('../utils/APIFeature');

exports.getOne = (Model, ...populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOption.length) {
      query = query.populate(populateOption);
    }

    const doc = await query;

    if (!doc) {
      throw new AppError('document is not exist', 404);
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model, ...populateOption) =>
  catchAsync(async (req, res, next) => {
    const feature = new APIFeature(Model.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .limit()
      .fields();

    if (populateOption.length) {
      feature.query = feature.query.populate(populateOption);
    }

    const docs = await feature.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    if (!doc) {
      throw new AppError('document is not created, something went wrong!', 400);
    }

    res.status(201).json({
      status: 'success',
      message: 'new document is created successfully!',
      data: {
        data: doc,
      },
    });
  });
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const doc = await Model.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new AppError('doc is not exist!', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'document is updated successfully!',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      throw new AppError(`document doesn't exist, or already has been deleted!`, 404);
    }

    res.status(204).json({
      status: 'success',
      message: 'document is removed successfully!',
      data: {
        data: doc,
      },
    });
  });
