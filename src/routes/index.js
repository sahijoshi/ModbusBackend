var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    res.send([{"status": true}]);
});

module.exports = router;
