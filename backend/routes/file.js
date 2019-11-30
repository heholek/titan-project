var express = require('express');
var router = express.Router();

var system = require("../utils/system")
const constants = require("../utils/constants")
const fs = require('fs-extra')

// Check if a file exists by hash

router.post('/exists', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.body.hash == undefined) {
        res.status(400);
        res.send(JSON.stringify({ "config_ok": false, "succeed": false }));
    } else {
        res.status(200);
        var filepath = system.buildLocalLogFilepath(req.body.hash)
        fs.access(filepath, fs.F_OK, (err) => {
            if (err) {
                res.send(JSON.stringify({ "config_ok": true, "exists": false, "succeed": true }));
            } else {
                res.send(JSON.stringify({ "config_ok": true, "exists": true, "succeed": true }));
            }
        })
    }
})

// Upload a logfile

router.post('/upload', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.body.hash == undefined || req.body.file_content == undefined || !system.isFilehashValid(req.body.hash)) {
        res.status(400);
        res.send(JSON.stringify({ "config_ok": false }));
    } else {
        res.status(200);
        var filepath = constants.LOGFILES_DIR + req.body.hash + ".log"
        system.writeStringToFile(null, filepath, req.body.file_content, () => {
            res.send(JSON.stringify({ "config_ok": true, "succeed": true }));
        })
    }
})



module.exports = router;
