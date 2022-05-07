const express = require('express');
const expRouter = require('./routes/expRoutes');
const errorController = require('./controllers/errorController');

const app = express();

app.use('api/v1/exps', expRouter);

// error middleware
app.use(errorController);

module.exports = app;
