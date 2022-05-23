const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const expRouter = require('./routes/expRoutes');
const userRouter = require('./routes/userRoutes');
const likeRouter = require('./routes/likeRotes');
const dissLikeRouter = require('./routes/dissLikeRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const markRouter = require('./routes/markRoutes');
const commentRouter = require('./routes/commentsRoutes');
const likeCommentRouter = require('./routes/likeCommentRoutes');
const followRouter = require('./routes/followRoutes');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const app = express();
// to parse forms
app.use(bodyParser.urlencoded({ extended: true }));
// to parse json body
app.use(bodyParser.json());
// to parse cookies comes from client
app.use(cookieParser());
// morgan middleware: to log requests
app.use(morgan('dev'));

app.use('/api/v1/exps', expRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/dissLikes', dissLikeRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/marks', markRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/likeComments', likeCommentRouter);
app.use('/api/v1/follows', followRouter);

// error 404 in case we didn't find any route
app.all('*', (req, res, next) => {
  const err = new AppError(`i can't find this URL: ${req.originalUrl}`, 404);
  next(err);
});

// error middleware
app.use(errorController);

module.exports = app;
