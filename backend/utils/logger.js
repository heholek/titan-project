const constants = require("./constants")

const pinoExpress = require('express-pino-logger')({})
const logger = require('pino')({});

module.exports = {
    pinoExpress: pinoExpress,
    logger: logger
};
