const BroadlinkJS = require('broadlinkjs-rm');
const shortid = require('shortid');

class BroadlinkService {
    constructor(db) {
        this.db = db;
        this.broadlink = new BroadlinkJS();
    }

    initialize() {
        this.db.get('blasters')
            .forEach(blaster => {
                this.createBlaster(blaster);
            })
            .value();

        this.broadlink.on('deviceReady', (blaster) => {
            this.db.get('blasters').find({ mac: blaster.mac }).assign({ active: true }).value();
        });
    }

    getBroadlinkBlasters() {
        return this.broadlink.devices;
    }

    blasterToBroadlink(blaster) {
        return this.getBroadlinkBlasters()[blaster.mac];
    }

    createBlaster(obj) {
        const blaster = { 'id': shortid(), 'devices': [], ...obj, active: false };
        this.db.get('blasters').find({ id: blaster.id }).assign(blaster).value();
        const { address, port, mac, type } = blaster;
        this.broadlink.addDevice({ address, port }, mac, Number(type).toString(16) || 0x5f36);
        return { blaster, broadlinkBlaster: this.blasterToBroadlink(blaster) };
    }

    learnCommand(blaster) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = this.blasterToBroadlink(blaster);

            const close = () => {
                broadlinkDevice.removeListener('rawData', onData);
                broadlinkDevice.cancelLearn();
                clearInterval(getDataInterval);
                clearTimeout(learningTimeout);
            }

            const onData = (data) => {
                close();
                resolve(data.toString('hex'));
            }

            const learningTimeout = setTimeout(() => {
                close();
                const error = new Error('Blaster Learning Timeout!');
                error.code = 'ETIMEDOUT';
                reject(error);
            }, 10000);

            const getDataInterval = setInterval(() => {
                broadlinkDevice.checkData();
            }, 1000);

            broadlinkDevice.on('rawData', onData);

            broadlinkDevice.enterLearning();
        });
    }

    sendCommand(blaster, command) {
        const broadlinkDevice = this.blasterToBroadlink(blaster);

        if (!broadlinkDevice)
            throw new Error(`Missing Broadlink Blaster: ${JSON.stringify(blaster)} ${JSON.stringify(broadlinkDevice)}`);

        const data = Buffer.from(command.data, 'hex');
        broadlinkDevice.sendData(data);

        if (command.repeat) {
            let repeatsRemaining = command.repeat;

            const sendDataInterval = setInterval(() => {
                repeatsRemaining -= 1;
                broadlinkDevice.sendData(data);
                if(repeatsRemaining <= 0){
                    clearInterval(sendDataInterval);
                }
            }, command.delay);
        }
    }
}

module.exports = BroadlinkService;
