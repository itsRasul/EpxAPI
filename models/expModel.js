const mongoose = require('mongoose');

const expSchema = new mongoose.Schema({
  name: String,
});

const Exp = mongoose.model('Exp', expSchema);

module.exports = Exp;
