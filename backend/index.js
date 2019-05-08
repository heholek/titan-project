// Includes

var exec = require('child_process').exec;
const fs = require('fs');

const express = require('express')
var bodyParser = require('body-parser')
var quote = require('shell-quote').quote;
var cors = require('cors')
var uniqid = require('uniqid');
var morgan = require('morgan')
var request = require('request');
const NodeCache = require("node-cache");
const myMemoryCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const log = require('simple-node-logger').createSimpleLogger({ timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS' });

// Some constants

var OUTPUT_FILTER = "output { stdout { codec => json_lines } }";

// Environments variables

const PORT = process.env.PORT || 8081;
const MAX_EXEC_TIMEOUT = process.env.MAX_EXEC_TIMEOUT || 120000;
const LOGSTASH_DATA_DIR = process.env.LOGSTASH_DATA_DIR || "/tmp/logstash/data/";
const LOGFILES_DIR = process.env.LOGFILES_DIR || "/tmp/logstash/logfiles/";
const LOGSTASH_RAM = process.env.LOGSTASH_RAM || "1g";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const MAX_BUFFER_STDOUT = process.env.MAX_BUFFER_STDOUT || 1024 * 1024 * 1024;
const KIBANA_VERSION = process.env.KIBANA_VERSION || "6.7.0";
const KIBANA_HOST = process.env.KIBANA_HOST || "localhost:5601";


///////////////////////////////
// Some system util function //
///////////////////////////////

// Create a directory (sync)

function createDirectory(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {
            recursive: true
        });
    }
}

// We create the local directories directory

createDirectory(LOGSTASH_DATA_DIR)
createDirectory(LOGFILES_DIR)

// Write a string content to file

function writeStringToFile(id, filepath, data, callback) {
    fs.writeFile(filepath, data, function (err) {
        if (err) {
            if (id != undefined) {
                log.error(id + " - Unable to write data to file '" + filepath + "'");
            } else {
                log.error("Unable to write data to file '" + filepath + "'");
            }
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
        input += " codec => " + formatCustomCodec(custom_codec);
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
app.use(bodyParser.json({ limit: '100mb' }))
app.use(morgan('combined'))

// Home rooting

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "message": "Nothing here !" }));
})

// Rooting for process starting

app.post('/start_process', function (req, res) {

    var id = uniqid()

    log.info(id + " - Start a Logstash process");

    if (argumentsValids(id, req, res)) {

        var input = {
            type: (req.body.input_data != null ? "input" : "file")
        }

        if (input.type == "input") {
            input.data = quote([req.body.input_data]);
        } else {
            input.filehash = req.body.filehash;
        }

        var instanceDirectory = LOGSTASH_DATA_DIR + id + "/"

        createDirectory(instanceDirectory)

        var logstash_input = buildLogstashInput(req.body.input_extra_fields, req.body['custom_codec'])
        var logstash_filter = req.body.logstash_filter;
        var logstash_version = req.body.logstash_version

        if (req.body['custom_logstash_patterns'] != undefined) {
            var custom_logstash_patterns = req.body.custom_logstash_patterns;
            var pattern_directory = instanceDirectory + "patterns/";
            createDirectory(pattern_directory)
            writeStringToFile(id, pattern_directory + "custom_patterns", custom_logstash_patterns, function () { });
            logstash_filter = logstash_filter.replace(/grok\s*{/gi, ' grok { patterns_dir => ["' + pattern_directory + '"] ')
        }

        var logstash_conf = logstash_input + logstash_filter + OUTPUT_FILTER;

        var logstash_conf_filepath = instanceDirectory + "logstash.conf"

        writeStringToFile(id, logstash_conf_filepath, logstash_conf, function () {
            computeResult(id, res, input, instanceDirectory, logstash_version, logstash_conf_filepath);
        })

    }
})

// Check if a file exists by hash

app.post('/file/exists', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.body.hash == undefined) {
        res.status(400);
        res.send(JSON.stringify({ "config_ok": false }));
    } else {
        res.status(200);
        filepath = buildLocalLogFilepath(req.body.hash)
        fs.access(filepath, fs.F_OK, (err) => {
            if (err) {
                res.send(JSON.stringify({ "config_ok": true, "exists": false }));
            } else {
                res.send(JSON.stringify({ "config_ok": true, "exists": true }));
            }
        })
    }
})


// Store a user config

app.post('/config/store', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.body.hash == undefined && req.body.config == undefined) {
        res.status(400);
        res.send(JSON.stringify({ "config_ok": false }));
    } else {
        res.status(200);

        myMemoryCache.set(req.body.hash, { value: req.body.config }, function (err, success) {
            if (!err && success) {
                res.send(JSON.stringify({ "config_ok": true, "succeed": true, "hash": req.body.hash }));
            } else {
                res.send(JSON.stringify({ "config_ok": true, "succeed": false }));
            }
        });
    }
})

// Get a user config

app.post('/config/get', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.body.hash == undefined) {
        res.status(400);
        res.send(JSON.stringify({ "config_ok": false }));
    } else {
        res.status(200);

        myMemoryCache.get(req.body.hash, function (err, config) {
            if (!err && config != undefined) {
                res.send(JSON.stringify({ "config_ok": true, "succeed": true, "config": config }));
            } else {
                res.send(JSON.stringify({ "config_ok": true, "succeed": false }));
            }
        });
    }
})

// Try to guess the config using the Kibana Machine Learning API

app.post('/guess_config', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.body.filehash == undefined && req.body.input_data == null) {
        res.status(400);
        res.send(JSON.stringify({ "config_ok": false }));
    } else {
        if (req.body.filehash != undefined) {
            filepath = buildLocalLogFilepath(req.body.filehash)
            fs.readFile(filepath, 'utf8', function (err, contents) {
                if (err != undefined) {
                    res.send(JSON.stringify({ "config_ok": true, "exists": false }));
                } else {
                    guessConfig(res, contents)
                }
            });
        } else {
            guessConfig(res, req.body.input_data)
        }
    }
})

app.post('/file/upload', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.body.hash == undefined || req.body.file_content == undefined || !isFilehashValid(req.body.hash)) {
        res.status(400);
        res.send(JSON.stringify({ "config_ok": false }));
    } else {
        res.status(200);
        filepath = LOGFILES_DIR + req.body.hash + ".log"
        writeStringToFile(null, filepath, req.body.file_content, () => {
            res.send(JSON.stringify({ "config_ok": true, "succeed": true }));
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


// Check if a filehash is valid or not
function isFilehashValid(hash) {
    return hash.match(/^[a-zA-Z0-9]{32}$/g)
}

// Build the input user filepath

function buildLocalLogFilepath(hash) {
    return LOGFILES_DIR + hash + ".log";
}

// Compute the logstash result

function computeResult(id, res, input, instanceDirectory, logstash_version, logstash_conf_filepath) {
    log.info(id + " - Starting logstash process");

    var command_user_data = ""

    if (input.type == "input") {
        command_user_data = 'echo ' + input.data
    } else {
        command_user_data = "cat " + buildLocalLogFilepath(input.filehash)
    }

    var logstash_temp_datadir = instanceDirectory + "temp_data"
    var command = command_user_data + ' | LS_JAVA_OPTS="-Xms' + LOGSTASH_RAM + ' -Xmx' + LOGSTASH_RAM + '" /logstash/logstash-"' + logstash_version + '"/bin/logstash --log.level warn --path.data ' + logstash_temp_datadir + ' -f ' + logstash_conf_filepath + ' -i';

    var options = {
        timeout: MAX_EXEC_TIMEOUT,
        maxBuffer: MAX_BUFFER_STDOUT
    }

    var startTime = new Date()

    try {
        exec(command, options, (err, stdout, stderr) => {
            log.info(id + " - Ended a Logstash process");

            var status = 0;

            if (err instanceof Error) {
                status = err.code;
            }

            var job_result = {
                stdout: stdout.toString('utf8'),
                stderr: stderr.toString('utf8'),
                status: status,
                response_time: new Date() - startTime
            };

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ "config_ok": true, "job_result": job_result }));
        });
    } catch (ex) {
        var job_result = {
            stderr: "",
            stdout: ex.toString('utf8'),
            status: -1
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            "config_ok": true,
            "job_result": job_result
        }));
    }

}

// Function to try to guess a config

function guessConfig(res, data) {
    res.setHeader('Content-Type', 'application/json');

    request.post({
        headers: {
            'content-type': 'text/plain',
            'kbn-version': KIBANA_VERSION
        },
        url: 'http://' + KIBANA_HOST + '/api/ml/file_data_visualizer/analyze_file',
        body: data
    }, function (error, response, body) {
        if (error != undefined) {
            res.send(JSON.stringify({
                "config_ok": true,
                "succeed": false
            }));
        } else {
            try {
                var kibanaConfig = JSON.parse(body);

                var conf = {
                    multiline_start_pattern: kibanaConfig.results.multiline_start_pattern,
                    grok_pattern: kibanaConfig.results.grok_pattern,
                    timestamp_field: kibanaConfig.results.timestamp_field,
                    joda_timestamp_formats: kibanaConfig.results.joda_timestamp_formats,
                    mappings: kibanaConfig.results.mappings
                }

                res.send(JSON.stringify({
                    "config_ok": true,
                    "succeed": true,
                    "configuration": conf
                }));
            } catch (e) {
                res.send(JSON.stringify({
                    "config_ok": true,
                    "succeed": false
                }));
            }
        }
    });
}

// Format the custom codec to remove options that are not accurate for this web version
function formatCustomCodec(codec) {
    rawCodec = codec.split('\n')
    codecFormatted = ""

    rawCodec.forEach(line => {
        if (!(line.includes("patterns_dir") || (line.includes("patterns_files_glob ")))) {
            codecFormatted += line + "\n"
        }
    });

    return codecFormatted
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

    if (req.body.input_data == undefined && req.body.filehash == undefined) {
        missing_fields.push("input_data")
        missing_fields.push("filehash")
        ok = false
    }

    if (req.body.filehash != undefined && !isFilehashValid(req.body.filehash)) {
        missing_fields.push("filehash_format")
        ok = false
    }

    if (req.body.logstash_version == undefined && !/^\d\.\d\.\d$/.test(req.body.logstash_version)) {
        missing_fields.push("logstash_version")
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

    if (req.body['input_extra_fields'] == undefined) {
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