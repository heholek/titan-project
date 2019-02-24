// Includes

var exec = require('child_process').exec;

const express = require('express')
var bodyParser = require('body-parser')
var quote = require('shell-quote').quote;
var cors = require('cors')
var uniqid = require('uniqid');

const log = require('simple-node-logger').createSimpleLogger();

// Some constants

var OUTPUT_FILTER = "output{stdout{}}";

// Environments variables

const PORT = process.env.PORT || 8081;
const MAX_EXEC_TIMEOUT = process.env.MAX_EXEC_TIMEOUT || 60000;
const LOGSTASH_DATA_DIR = process.env.LOGSTASH_DATA_DIR || "/tmp/logstash/data/";
const LOGSTASH_RAM = process.env.LOGSTASH_RAM || "1g";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

/////////////////////////////
// Logstash util functions //
/////////////////////////////

// Build the Logstash input

function buildLogstashInput(attributes) {
    var input = "input{stdin{";

    for(var i = 0 ; i < attributes.length ; i++) {
        input += ' add_field => { "' + attributes[i].attribute + '" => "' + attributes[i].value + '" }';
    }

    input += "}}";
    return input;
}

//////////////////
//  Server part //
//////////////////

// Some init definitions

log.setLevel(LOG_LEVEL);

const app = express()
app.use(cors())
app.use(bodyParser.json({limit: '10mb'}))

// Home rooting

app.get('/', function (req, res) {
    var id = uniqid()

    log.info(id + " - Someone hit slash");
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "message": "Nothing here !" }));
})

// Rooting for process starting

app.post('/start_process', function (req, res) {
    
    var id = uniqid()

    log.info(id + " - Start a Logstash process");

    if (argumentsValids(req, res)) {
        var input_data = quote([req.body.input_data]);

        var logstash_input = buildLogstashInput(req.body.input_extra_fields)

        var logstash_conf = quote([logstash_input + req.body.logstash_filter + OUTPUT_FILTER]);

        computeResult(id, res, input_data, logstash_conf);
    }
})

// We start the server

app.listen(PORT, function () {
    log.info('App listening on port ' + PORT);
})

////////////////////////
//  Compute functions //
////////////////////////

// Compute the logstash result

function computeResult(id, res, input_data, logstash_conf) {
    log.info(id + " - Starting logstash process");

    var command = 'echo ' + input_data + ' | LS_JAVA_OPTS="-Xms' + LOGSTASH_RAM + ' -Xmx' + LOGSTASH_RAM + '" /usr/share/logstash/bin/logstash --path.data ' + LOGSTASH_DATA_DIR + id + ' -e ' + logstash_conf + ' -i | tail -n +2';

    var options = {
        timeout: MAX_EXEC_TIMEOUT
    }

    exec(command, options, (err, stdout, stderr) => {
        log.info(id + " - Ended a Logstash process");

        var status = 0;

        if (err instanceof Error) {
            status = err.code;
        }

        var job_result = {
            stdout: stdout.toString('utf8'),
            stderr: stderr.toString('utf8'),
            status: status
        };

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ "config_ok": true, "job_result": job_result}));
    });

}

// Fail because of bad parameters

function failBadParameters(id, res, missing_fields) {
    log.warn(id + " - Bad parameters for request");

    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    res.send(JSON.stringify({ "config_ok": false, "missing_fields": missing_fields }));
}

// Check if provided arguments are valids

function argumentsValids(req, res) {
    var ok = true

    var missing_fields = []

    if (req.body.input_data == undefined) {
        missing_fields.push("input_data")
        ok = false
    }

    if (req.body.logstash_filter == undefined) {
        missing_fields.push("logstash_filter")
        ok = false
    }

    if (!ok) {
        failBadParameters(id, res, missing_fields)
    }

    for (var i = 0 ; i < req.body.input_extra_fields.length ; i++) {
        if (req.body.input_extra_fields[i].attribute == "" || req.body.input_extra_fields[i].value == "") {
            ok = false;
            missing_fields.push("input_extra_fields")
            break;
        }
    }

    return ok
}