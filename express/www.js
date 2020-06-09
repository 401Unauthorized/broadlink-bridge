#!/usr/bin/env node

const http = require('http');

const normalizePort = (val) => {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    console.error(`${port} is an invalid port value`);
    throw new Error(`${port} is an invalid port value`);
}

module.exports.startHTTPServer = (app) => {
    const port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);
    const server = http.createServer(app);
    server.listen(port);
    server.on('error', (error) => {
        if (error.syscall !== 'listen') throw error;

        const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    server.on('listening', () => {
        const addr = server.address();
        const port = typeof addr === 'string' ? addr : addr.port;
        const address = typeof addr === 'object' && addr.address;

        const response = {
            status: 'Running!',
            address,
            port,
            tokens: process.env.TOKENS.split(',')
        }

        console.log(JSON.stringify(response, null, ' '));
    });
}