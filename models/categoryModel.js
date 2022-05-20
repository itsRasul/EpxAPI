const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'category must has a name!'],
    maxlength: [25, 'category must be less than 25 character'],
  },
  parentCategory: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
