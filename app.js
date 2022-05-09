const express = require('express');
const bodyParser = require('body-parser');
const expRouter = require('./routes/expRoutes');
const userRouter = require('./routes/userRoutes');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const app = express();
// to parse forms
app.use(bodyParser.urlencoded({ extended: true }));
// to parse json body
app.use(bodyParser.json());

app.use('/api/v1/exps', expRouter);
app.use('/api/v1/users', userRouter);

// error 404 in case we didn't find any route
app.all('*', (req, res, next) => {
  const err = new AppError(`i can't find this URL: ${req.originalUrl}`, 404);
  next(err);
});

// error middleware
app.use(errorController);

module.exports = app;
