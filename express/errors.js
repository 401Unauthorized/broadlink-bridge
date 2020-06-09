const createError = require('http-errors');

module.exports.errors = function (app, express) {
    app.use(function (req, res, next) {
        next(createError(404));
    });
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({error: err});
    });
}
