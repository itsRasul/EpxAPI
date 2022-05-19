const mongoose = require('mongoose');
const Exp = require('./expModel');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'like must belongs to a user!'],
  },
  exp: {
    type: mongoose.Types.ObjectId,
    ref: 'Exp',
    required: [true, 'like must belongs to a experience!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

likeSchema.index({ user: 1, exp: 1 }, { unique: true });

likeSchema.statics.addOneLikeToTourInLikesQuantityField = async function (expId, operator) {
  // this points to model
  if (operator === 'plus') {
    await Exp.findOneAndUpdate(
      { _id: expId },
      {
        //$inc stands for increment
        $inc: { likesQuantity: 1 },
      },
      {
        new: true,
      }
    );
  } else {
    await Exp.findOneAndUpdate(
      { _id: expId },
      {
        $inc: { likesQuantity: -1 },
      },
      {
        new: true,
      }
    );
  }
};

// we wanna every time a like is submited increase likesQuantity field in that tour, this middleware fun execute in .save() and .create()
likeSchema.post('save', function () {
  // this points to current doc
  this.constructor.addOneLikeToTourInLikesQuantityField(this.exp, 'plus');
});

// we wanna execute addOneLikeToTour... function when a like has been deleted, this middleware func execute in .findOneAndDelete() and...
likeSchema.pre(/^findOneAndDelete/, async function (next) {
  // this points to query
  // query.clone() is the same pre query
  // if we wanted to execute pre the same query, use this method '.clone()'
  this.likeDoc = await this.clone();
  next();
});

likeSchema.post(/^findOneAndDelete/, function () {
  if (this.likeDoc) {
    this.likeDoc.constructor.addOneLikeToTourInLikesQuantityField(this.likeDoc.exp, 'minus');
  }
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
