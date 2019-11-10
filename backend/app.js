// Includes

const fs = require('fs-extra')
const express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var morgan = require('morgan')
const log = require('simple-node-logger').createSimpleLogger({ timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS' });

const constants = require("./utils/constants")

require("./process/cleanup")

// Routes

var indexRouter = require('./routes/index');
var configRouter = require('./routes/config');
var fileRouter = require('./routes/file');
var guessConfigRouter = require('./routes/guess_config');
var grokTesterRouter = require('./routes/grok_tester');
var logstashRouter = require('./routes/logstash');

///////////////////////////////
// Some system util function //
///////////////////////////////

// We create the local directories directory

fs.ensureDirSync(constants.LOGSTASH_DATA_DIR)
fs.ensureDirSync(constants.LOGFILES_DIR)
fs.ensureDirSync(constants.LOGFILES_TEMP_DIR)
fs.ensureDirSync(constants.LOGSTASH_TMP_DIR)

//////////////////
//  Server part //
//////////////////

// Some init definitions

log.setLevel(constants.LOG_LEVEL);

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: constants.JSON_BODY_LIMIT }))
app.use(morgan('combined'))

app.use('/', indexRouter);
app.use('/config', configRouter);
app.use('/file', fileRouter);
app.use('/guess_config', guessConfigRouter);
app.use('/grok_tester', grokTesterRouter);
app.use('/logstash', logstashRouter);

// We start the server

app.listen(constants.PORT, function () {
    log.info('App listening on port ' + constants.PORT);
})
