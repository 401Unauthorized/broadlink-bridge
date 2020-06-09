const { lowdb } = require('../models');
const BroadlinkService = require('./broadlink');

const broadlink = new BroadlinkService(lowdb);

broadlink.initialize();

module.exports = { broadlink };
