var cron = require('node-cron');
var loadModbusData = require('../service/service');

// Cron job set to time interval of 2 min

let task = cron.schedule('*/5 * * * * *', () => {
    loadModbusData();
    console.log('running a task every two minutes');
});
  
module.exports = task;
