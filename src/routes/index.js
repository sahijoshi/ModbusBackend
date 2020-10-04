var express = require('express');
var router = express.Router();
var modBusJson = require('../dataPersistence/modbus.json');

router.get("/modbus", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(modBusJson);
});

module.exports = router;
