const passport = require('passport');
const bearerStrategy = require('passport-http-bearer').Strategy;
const customStrategy = require('passport-custom').Strategy;

// Tokens set in env var or .env file
const tokens = new Set(process.env.TOKENS.split(','));

const validateToken = token => tokens.has(token);

const headerToken = (token, cb) => validateToken(token) ? cb(null, { token }) : cb(null, false);

const queryToken = (req, cb) => validateToken(req.query.token) ? cb(null, { token: req.query.token }) : cb(null, false);

module.exports.passport = function (app) {
    passport.use(new bearerStrategy(headerToken));
    passport.use('query-string', new customStrategy(queryToken));
    app.use(passport.authenticate(['bearer', 'query-string'], { session: false }));
}
