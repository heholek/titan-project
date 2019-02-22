var spawnSync = require('child_process').spawnSync;

const express = require('express')
var quote = require('shell-quote').quote;
var cors = require('cors')

var INPUT_FILTER = "input{stdin{}}";
var OUTPUT_FILTER = "output{stdout{}}";

const PORT = process.env.PORT || 8081;
const MAX_EXEC_TIMEOUT = process.env.MAX_EXEC_TIMEOUT || 60000;
const LOGSTASH_DATA_DIR = process.env.LOGSTASH_DATA_DIR || "/tmp/logstash/data";
const LOGSTASH_RAM = process.env.LOGSTASH_RAM || "1g";

const app = express()

app.use(express.json());
app.use(cors())

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "message": "Nothing here !"}));
})

function getResult(input, filter) {
    console.log("Starting logstash process");

    res = spawnSync('echo ' + input + ' | LS_JAVA_OPTS="-Xms' + LOGSTASH_RAM + ' -Xmx' + LOGSTASH_RAM + '" /usr/share/logstash/bin/logstash --path.data ' + LOGSTASH_DATA_DIR + ' -e ' + filter + ' -i', {
        shell: true,
        timeout: MAX_EXEC_TIMEOUT
    });
    var ret = {
        stdout: res.stdout.toString('utf8'),
        stderr: res.stderr.toString('utf8'),
        status: res.status
    };

    console.log("Ended Logstash process");
    return ret;
}

function failBadParameters(res, missing_fields) {
    console.log("Bad parameters for request");

    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    res.send(JSON.stringify({ "succeed": false, "missing_fields": missing_fields}));
}

function argumentsValids(req, res) {
    var ok = true

    var missing_fields = []

    if(req.body.input_data == undefined) {
        missing_fields.push("input_data")
        ok = false
    }

    if(req.body.logstash_filter == undefined) {
        missing_fields.push("logstash_filter")
        ok = false
    }

    if(!ok) {
        failBadParameters(res, missing_fields)
    }

    return ok
}

app.post('/start_process', function (req, res) {

    console.log("Start a process hit");

    if(argumentsValids(req, res)) {
        var input_data=quote([ req.body.input_data ]);

        var logstash_filter=quote([ INPUT_FILTER + req.body.logstash_filter + OUTPUT_FILTER ]);
    
    
        var job_result = getResult(input_data, logstash_filter);
    
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ "succeed": true, "job_result": job_result}));
    }
})

app.listen(PORT, function () {
    console.log('App listening on port ' + PORT);
})
