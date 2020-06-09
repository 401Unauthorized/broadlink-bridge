const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const corsSettings = {
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

module.exports.middleware = function (app, express) {
    morgan.token('apikey', (req, res) => req.user.token);
    app.use(morgan(':date[iso] :method :url :status :response-time ms :user-agent token=:apikey'));
    app.use(cors(corsSettings));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(helmet());
    app.use(compression());
}