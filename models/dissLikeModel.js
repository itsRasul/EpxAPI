const mongoose = require('mongoose');
const Exp = require('../models/expModel');

const dissLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'diss like must belongs to a user!'],
    },
    exp: {
      type: mongoose.Types.ObjectId,
      ref: 'Exp',
      required: [true, 'diss like must belongs to a experience!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

dissLikeSchema.index({ user: 1, exp: 1 }, { unique: true });

dissLikeSchema.statics.addOneLikeToTourInLikesQuantityField = async function (expId, operator) {
  // this points to model
  if (operator === 'plus') {
    await Exp.findOneAndUpdate(
      { _id: expId },
      {
        //$inc stands for increment
        $inc: { dissLikeQuantity: 1 },
      },
      {
        new: true,
      }
    );
  } else {
    await Exp.findOneAndUpdate(
      { _id: expId },
      {
        $inc: { dissLikeQuantity: -1 },
      },
      {
        new: true,
      }
    );
  }
};

// we wanna every time a like is submited increase likesQuantity field in that tour, this middleware fun execute in .save() and .create()
dissLikeSchema.post('save', function () {
  // this points to current doc
  this.constructor.addOneLikeToTourInLikesQuantityField(this.exp, 'plus');
});

// we wanna execute addOneLikeToTour... function when a like has been deleted, this middleware func execute in .findOneAndDelete() and...
dissLikeSchema.pre(/^findOneAndDelete/, async function (next) {
  // this points to query
  // query.clone() is the same pre query
  // if we wanted to execute pre the same query, use this method '.clone()'
  this.dissLikeDoc = await this.clone();

  next();
});

dissLikeSchema.post(/^findOneAndDelete/, function () {
  if (this.dissLikeDoc) {
    this.dissLikeDoc.constructor.addOneLikeToTourInLikesQuantityField(
      this.dissLikeDoc.exp,
      'minus'
    );
  }
});

const DissLike = mongoose.model('DissLike', dissLikeSchema);

module.exports = DissLike;
