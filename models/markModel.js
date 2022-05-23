const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const Exp = require('./expModel');

const markSchema = new mongoose.Schema({
  exp: {
    type: mongoose.Types.ObjectId,
    ref: 'Exp',
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

markSchema.statics.addOneMarkQuantity = async (expId, operation) => {
  if (operation == 'plus') {
    await Exp.findByIdAndUpdate(
      expId,
      {
        $inc: { marksQuantity: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  } else if (operation == 'minus') {
    await Exp.findByIdAndUpdate(
      expId,
      {
        $inc: { marksQuantity: -1 },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }
};

// we wanna increase markQuantity in expModel whenever an mark is created
markSchema.post('save', async function () {
  // this points to current mark
  await this.constructor.addOneMarkQuantity(this.exp, 'plus');
});

// we wanna decrease marksQuantity whenever a mark is deleted

markSchema.pre(/^findOneAndDelete/, async function (next) {
  // this points to current query
  // when we use .clone() the same query (pre query) is executed BUT in this time we don't go into pre and post query middlewares
  // and we just ran into pre and post query middleware when we execute in app not in (when we execute a query in pre query middleware function we don't go into query middlewares)

  this.currentMark = await this.clone();

  if (!this.currentMark) {
    return next(new AppError('mark is not exist, or is not created by you!', 404));
  }
  next();
});

markSchema.post(/^findOneAndDelete/, function () {
  this.currentMark.constructor.addOneMarkQuantity(this.currentMark.exp, 'minus');
});
const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;
