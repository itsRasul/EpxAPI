const Exp = require('../models/expModel');

exports.getAllExp = (req, res, next) => {
  res.status(200).send('this getAllExp controller');
};
