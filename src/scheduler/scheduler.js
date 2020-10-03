var cron = require('node-cron');

let task = cron.schedule('*/5 * * * * *', () => {
    console.log('running a task every two minutes');
});

module.exports = task;