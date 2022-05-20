const mongoose = require('mongoose');

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

const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;
