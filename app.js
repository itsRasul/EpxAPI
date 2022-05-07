const express = require('express');
const expRouter = require('./routes/expRoutes');

const app = express();

app.use('/', expRouter);

module.exports = app;
