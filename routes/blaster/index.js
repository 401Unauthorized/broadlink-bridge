const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const createError = require('http-errors');
const { lowdb } = require('../../models');
const { broadlink } = require('../../services');

// ----------- Blasters -----------

// Read Blasters
router.get('/', function (req, res, next) {
    const response = lowdb.get('blasters').value();
    res.json(response);
});

// Create Blaster
router.post('/', function (req, res, next) {
    const { blaster } = broadlink.createBlaster(req.body);
    const response = lowdb.get('blasters')
        .push(blaster)
        .write();
    res.send(response);
});

// Read Blaster
router.get('/:blaster', function (req, res, next) {
    const response = lowdb.get('blasters')
        .find({ id: req.params.blaster })
        .value();
    res.json(response);
});

// Update Blaster
router.put('/:blaster', function (req, res, next) {
    const response = lowdb.get('blasters')
        .find({ id: req.params.blaster })
        .assign(req.body)
        .write();
    res.json(response);
});

// Delete Blaster
router.delete('/:blaster', function (req, res, next) {
    const response = lowdb.get('blasters')
        .remove({ id: req.params.blaster })
        .write();
    res.json(response);
});

// ----------- Devices -----------

// Read Blaster's Devices
router.get('/:blaster/devices', function (req, res, next) {
    const devices = lowdb.get('devices');
    const blasters = lowdb.get('blasters');

    const response = blasters
        .find({ id: req.params.blaster })
        .get('devices')
        .map(id => devices.find({ id }))
        .value();

    res.json(response);
});

// Create Blaster's Device
router.post('/:blaster/devices', function (req, res, next) {
    const id = shortid();

    const blaster = lowdb.get('blasters')
        .find({ id: req.params.blaster })
        .get('devices')
        .push(id)
        .write();

    const device = lowdb.get('devices')
        .push({
            'id': id,
            'commands': [],
            ...req.body
        })
        .write();

    res.json({ blaster, device });
});


// Read Blaster's Device
router.get('/:blaster/devices/:device', function (req, res, next) {
    const response = lowdb.get('devices')
        .find({ id: req.params.device })
        .value();
    res.json(response)
});


// Update Blaster's Device
router.put('/:blaster/devices/:device', function (req, res, next) {
    const response = lowdb.get('devices')
        .find({ id: req.params.device })
        .assign(req.body)
        .value();
    res.json(response)
});


// Delete Blaster's Device
router.delete('/:blaster/devices/:device', function (req, res, next) {
    const device = lowdb.get('devices')
        .remove({ id: req.params.device })
        .write();

    const blaster = lowdb.get('blasters')
        .find({ id: req.params.blaster })
        .get('devices')
        .remove((x) => x === req.params.device)
        .write();

    res.json({ blaster, device });
});

// ----------- Commands -----------

// Read Blaster's Device's Commands
router.get('/:blaster/devices/:device/commands', function (req, res, next) {
    const response = lowdb.get('devices')
        .find({ id: req.params.device })
        .get('commands')
        .value();
    res.json(response)
});

// Create Blaster's Device's Command
router.post('/:blaster/devices/:device/commands', function (req, res, next) {
    const blaster = lowdb.get('blasters')
        .find({ id: req.params.blaster })
        .value();

    const { data } = req.body;

    const createCommand = data => {
        const newCommand = {
            repeat: 0,
            delay: 0,
            ...req.body,
            data
        };

        lowdb.get('devices')
            .find({ id: req.params.device })
            .get('commands')
            .push(newCommand)
            .write();

        res.json(newCommand);
    };

    if (data) {
        createCommand(data);
    } else {
        broadlink.learnCommand(blaster).then(createCommand).catch(err => {
            if (err.code === 'ETIMEDOUT') {
                next(createError(408, err));
            } else {
                next(createError(500, err))
            }
        });
    }
});

// Read Blaster's Device's Command
router.get('/:blaster/devices/:device/commands/:command', function (req, res, next) {
    const response = lowdb.get('devices')
        .find({ id: req.params.device })
        .get('commands')
        .find({ command: req.params.command })
        .value();
    res.json(response);
});

// Update Blaster's Device's Command
router.put('/:blaster/devices/:device/commands/:command', function (req, res, next) {
    const response = lowdb.get('devices')
        .find({ id: req.params.device })
        .get('commands')
        .find({ command: req.params.command })
        .assign(req.body)
        .value();
    res.json(response);
});

// Delete Blaster's Device's Command
router.delete('/:blaster/devices/:device/commands/:command', function (req, res, next) {
    const response = lowdb.get('devices')
        .find({ id: req.params.device })
        .get('commands')
        .remove({ command: req.params.command })
        .write();
    res.json(response);
});


// ----------- Emitter (IR) -----------

// Emit Blaster's Device's Command
router.all('/:blaster/devices/:device/commands/:command/emit', function (req, res, next) {
    const blaster = lowdb.get('blasters')
        .find({ id: req.params.blaster })
        .value();

    const command = lowdb.get('devices')
        .find({ id: req.params.device })
        .get('commands')
        .find({ command: req.params.command })
        .value();

    broadlink.sendCommand(blaster, command);
    res.json({ status: 'Done!' });
});

module.exports = router;