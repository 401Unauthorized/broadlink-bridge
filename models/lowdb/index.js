const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = low(new FileSync(path.join(global.appRoot, 'models/lowdb/db.json')));

db.defaults({ blasters: [], devices: [] }).write();

module.exports = db;
