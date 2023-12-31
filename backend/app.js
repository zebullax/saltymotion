// Node/Express
const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
// Misc
const middlewareLogger = require('morgan');
const bodyParser = require('body-parser');
// Saltymotion
const sessionAPIRouter = require('./api/session');
const userAPIRouter = require('./api/user');
const atelierAPIRouter = require('./api/atelier');
const gameAPIRouter = require('./api/game');
const walletAPIRouter = require('./api/wallet');
const tagAPIRouter = require('./api/tag');
const reviewerAPIRouter = require('./api/reviewer');
const webhookRouter = require('./routes/webhookRouter');
const authRouter = require('./routes/authRouter');
const middleware = require('./lib/middleware');
// Other libs

const app = express();

app.enable('etag');
app.use(favicon(path.join(__dirname, 'images', 'favicon.ico')));
app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'template', 'views'));
app.set('view engine', 'pug');
app.use(middlewareLogger(process.env.NODE_ENV === 'dev' ? 'common' : 'tiny'));
app.use(bodyParser.json({
  json: { limit: '50mb', extended: true },
  urlencoded: { limit: '50mb', extended: true },
  verify(req, res, buf, encoding) {
    req.rawBody = buf.toString(encoding); // webhook secret signing needs raw buffer
  },
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(middleware.extractJWT);

// Routing
app.use('/api/v1', userAPIRouter);
app.use('/api/v1', sessionAPIRouter);
app.use('/api/v1', atelierAPIRouter);
app.use('/api/v1', walletAPIRouter);
app.use('/api/v1', tagAPIRouter);
app.use('/api/v1', gameAPIRouter);
app.use('/api/v1', reviewerAPIRouter);
app.use('/auth', authRouter);
app.use('/', webhookRouter);

module.exports.app = app;
