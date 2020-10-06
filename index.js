var express = require("express");
var indexRouter = require('./src/routes/index');
var config = require('./src/config/config');
var scheduler = require('./src/scheduler/scheduler');

const app = express();

app.use('/', indexRouter);

/**
 * Run cron job to fetch data from Modbus live feed.
 */

scheduler.start();

/**
 * Create HTTP and listen on port.
 */

app.listen(config.port, () => {
    console.log('success');
}).on('error', (err) => {
    if (err.errno === 'EADDRINUSE') {
        console.log('port busy');
    }
    else {
        console.log(err);
    }
});