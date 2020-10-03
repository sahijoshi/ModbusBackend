var express = require("express");
var indexRouter = require('./src/routes/index');

const app = express();

/**
 * Get port from environment and store in Express.
 */

let port = process.env.PORT || 3000;

/**
 * Use router service.
 */

app.use('/', indexRouter);

/**
 * Create HTTP and listen on port.
 */

app.listen(port, () => {
    console.log('success');
}).on('error', (err) => {
    if (err.errno === 'EADDRINUSE') {
        console.log('port busy');
    }
    else {
        console.log(err);
    }
});

