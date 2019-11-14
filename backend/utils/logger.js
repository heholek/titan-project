const constants = require("./constants")

const pinoConfiguration = {
    prettyPrint: { 
        colorize: true,
        translateTime: true
    }
}

const prettyDisplay = constants.PRETTY_LOG == "true"

const pinoExpress = require('express-pino-logger')(prettyDisplay ? pinoConfiguration : {})
const logger = require('pino')(prettyDisplay ? pinoConfiguration : {});


module.exports = {
    pinoExpress: pinoExpress,
    logger: logger
};
