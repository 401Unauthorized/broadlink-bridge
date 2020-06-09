const path = require('path');
const express = require('express');

const { middleware } = require('./middleware');
const { passport } = require('./passport');
const { errors } = require('./errors');

const indexRouter = require('../routes/index/index');
const blasterRouter = require('../routes/blaster');

const app = express();

middleware(app, express);

passport(app);

app.use('/', indexRouter);
app.use('/blasters', blasterRouter);

errors(app, express);

module.exports = app;
