var cron = require('node-cron');
var fs = require('fs');
const FILE_NAME = 'feed.txt';

const x = mapEvents(pullModubusLiveFeedData(FILE_NAME));

function pullModubusLiveFeedData(filename) {
    return fs
    .readFileSync(filename, 'utf-8')
    .toString()
    .replace(/\r\n/g,'\n')
    .split('\n');
    // .split('\n')
    // .filter(Boolean)
    // .map(JSON.parse);
}

let task = cron.schedule('* */1 * * * *', () => {
    // pullModubusLiveFeedData();
    console.log('running a task every two minutes');
});

function mapEvents(events) {
    return JSON.stringify(events);
}
  
module.exports = task;
module.exports = x;