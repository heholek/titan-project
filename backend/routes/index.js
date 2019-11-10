var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "message": "Nothing here !" }));
})

module.exports = router;
