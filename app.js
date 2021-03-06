const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const XSS = require('xss-clean');
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

// rate limiter
const ratLimiterApi = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request! please try again!',
});
app.use('/', ratLimiterApi);

// to avoiding XSS attacks, sets some security http headers
app.use(helmet());
// to parse forms
app.use(bodyParser.urlencoded({ extended: true }));
// to parse json body
app.use(bodyParser.json({ limit: '10kb' }));
// to parse cookies comes from client
app.use(cookieParser());
// providing NoSQL query injection
app.use(mongoSanitize());
// sanitize xss attacks
app.use(XSS());

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
