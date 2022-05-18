const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  exp: {
    type: mongoose.Types.ObjectId,
    ref: 'Exp',
  },
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
