const mongoose = require('mongoose');

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
});

likeSchema.index({ user: 1, exp: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
