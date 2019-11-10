var express = require('express');
var router = express.Router();

const NodeCache = require("node-cache");
const myMemoryCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// Store a user config

router.post('/store', function (req, res) {
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

router.post('/get', function (req, res) {
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

module.exports = router;
