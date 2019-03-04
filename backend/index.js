// Includes

var exec = require('child_process').exec;
const fs = require('fs');

const express = require('express')
var bodyParser = require('body-parser')
var quote = require('shell-quote').quote;
var cors = require('cors')
var uniqid = require('uniqid');

const log = require('simple-node-logger').createSimpleLogger({timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'});

// Some constants

var OUTPUT_FILTER = "output{stdout{}}";

// Environments variables

const PORT = process.env.PORT || 8081;
const MAX_EXEC_TIMEOUT = process.env.MAX_EXEC_TIMEOUT || 60000;
const LOGSTASH_DATA_DIR = process.env.LOGSTASH_DATA_DIR || "/tmp/logstash/data/";
const LOGSTASH_RAM = process.env.LOGSTASH_RAM || "1g";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

///////////////////////////////
// Some system util function //
///////////////////////////////

// Create a directory (sync)

function createDirectory(directory) {
    if (!fs.existsSync(directory)){
        fs.mkdirSync(directory);
    }
}


// Write a string content to file

function writeStringToFile(id, filepath, data, callback) {
    fs.writeFile(filepath, data, function (err) {
        if (err) {
            log.err(id + " - Unable to write data to file '" + filepath + "'");
        }
        callback()
    });
}

/////////////////////////////
// Logstash util functions //
/////////////////////////////

// Build the Logstash input

function buildLogstashInput(attributes, custom_codec) {
    var input = "input{stdin{";

    for (var i = 0; i < attributes.length; i++) {
        input += ' add_field => { "' + attributes[i].attribute + '" => "' + attributes[i].value + '" }';
    }

    if (custom_codec != undefined) {
        input += " codec => " + custom_codec;
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
app.use(bodyParser.json({ limit: '10mb' }))

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

    if (argumentsValids(id, req, res)) {
        var input_data = quote([req.body.input_data]);

        var instanceDirectory = LOGSTASH_DATA_DIR + id + "/"

        createDirectory(instanceDirectory)

        var logstash_input = buildLogstashInput(req.body.input_extra_fields, req.body['custom_codec'])
        var logstash_filter = req.body.logstash_filter;

        if(req.body['custom_logstash_patterns'] != undefined) {
            var custom_logstash_patterns = req.body.custom_logstash_patterns;
            var pattern_directory = instanceDirectory + "patterns/";
            createDirectory(pattern_directory)
            writeStringToFile(id, pattern_directory + "custom_patterns", custom_logstash_patterns, function() {});
            logstash_filter = logstash_filter.replace(/grok\s*{/gi, ' grok { patterns_dir => ["' + pattern_directory + '"] ')
        }

        var logstash_conf = logstash_input + logstash_filter + OUTPUT_FILTER;

        var logstash_conf_filepath = instanceDirectory + "logstash.conf"
       
        writeStringToFile(id, logstash_conf_filepath, logstash_conf, function() {
            computeResult(id, res, input_data, instanceDirectory, logstash_conf_filepath, custom_logstash_patterns);
        })

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

function computeResult(id, res, input_data, instanceDirectory, logstash_conf_filepath) {
    log.info(id + " - Starting logstash process");

    var logstash_temp_datadir = instanceDirectory + "temp_data"
    var command = 'echo ' + input_data + ' | LS_JAVA_OPTS="-Xms' + LOGSTASH_RAM + ' -Xmx' + LOGSTASH_RAM + '" /usr/share/logstash/bin/logstash --path.data ' + logstash_temp_datadir + ' -f ' + logstash_conf_filepath + ' -i | tail -n +2';

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
        res.send(JSON.stringify({ "config_ok": true, "job_result": job_result }));
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

function argumentsValids(id, req, res) {
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

    if (req.body['custom_codec'] != undefined && req.body.custom_codec == "") {
        missing_fields.push("custom_codec")
        ok = false
    }

    if(req.body['input_extra_fields'] == undefined) {
        ok = false
    } else {
        for (var i = 0; i < req.body.input_extra_fields.length; i++) {
            if (req.body.input_extra_fields[i].attribute == "" || req.body.input_extra_fields[i].value == "") {
                ok = false;
                missing_fields.push("input_extra_fields")
                break;
            }
        }
    }

    if (!ok) {
        failBadParameters(id, res, missing_fields)
    }

    return ok
}