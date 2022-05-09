const mongoose = require('mongoose');

const expSchema = new mongoose.Schema({
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
  views: {
    type: Number,
    default: 0,
  },
});

const Exp = mongoose.model('Exp', expSchema);

module.exports = Exp;
