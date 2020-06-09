const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const { version } = require('../../package');

router.get('/', function (req, res, next) {
  res.send('Welcome to BroadLink Bridge!');
});

router.get('/health', function (req, res, next) {
  res.send('OK');
});

router.get('/version', function (req, res, next) {
  res.json({
    'version': process.env.npm_package_version || version
  });
});

router.get('/stats', function (req, res, next) {
  res.json({
    timestamp: Date.now(),
    uptime: {
      duration: process.uptime(),
      text: moment.duration(process.uptime(), 'seconds').humanize(),
      started: moment(moment.now() - moment.duration(process.uptime(), 'seconds'))
    },
    process: {
      ...process.memoryUsage(),
      pid: process.pid
    }
  });
});

module.exports = router;
