var express = require("express");
var indexRouter = require('./src/routes/index');
var config = require('./src/config/config');
// var scheduler = require('./src/scheduler/scheduler');
// var x = require('./src/scheduler/scheduler');
var fs = require('fs');
var registerTable = require('./src/util/registerTable')
const FILE_NAME = 'feed.txt';

const app = express();

app.use('/', indexRouter);

/**
 * Run cron job to fetch data from Modbus live feed.
 */


// scheduler.start();
// console.log(scheduler.x)
/**
 * Create HTTP and listen on port.
 */

// let a = ["1:3", "1:2","2:3","3:4"];
// let a = '[{"date": "2018-12-12"}]';

// const b = JSON.parse(a);

// console.log(b);

// const array = fs
// .readFileSync(FILE_NAME, 'utf-8')
// .toString()
// .replace(/\r\n/g,'\n')
// .split('\n');

// let date = array[0];
// console.log(date);
// console.log(array);

// for(let i of array) {
//     console.log(i);
// }

console.log(registerTable["1-2"]["varName"]);


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

