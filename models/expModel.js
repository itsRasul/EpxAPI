const mongoose = require('mongoose');

const expSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: [25, 'title must be less than 25 character'],
      required: [true, 'experience must have a title'],
    },
    experience: {
      type: String,
      required: [true, 'experience must have a experience field!'],
      maxlength: [280, 'experience should have less than 280 character'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'experience must belongs to a user!'],
    },
    category: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    views: {
      type: Number,
      default: 0,
    },
    likesQuantity: {
      type: Number,
      default: 0,
    },
    dissLikeQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ***************
/*
// when we wanna populate a field without have an grown array of id:
// below code causes to populate likes which belongs to this exp whenever we use .populate('likes') in query
// actully below code says we wanna populate the likes documents which 'exp' field in them are '_id' field in this model
expSchema.virtual('likes', {
  ref: 'Like',
  // the name of the field that keeps experience id in Like model
  foreignField: 'exp',
  // the name of the field that keeps experience id in current model (Exp)
  localField: '_id',
});
*/
// ***************

expSchema.pre(/^findOne/, function (next) {
  this.populate({
    path: 'user',
    select: 'userName photo',
  });
  next();
});

// expSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'category',
//     select: 'name',
//   });
//   next();
// });

const Exp = mongoose.model('Exp', expSchema);

module.exports = Exp;
