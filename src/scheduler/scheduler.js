var cron = require('node-cron');
var fs = require('fs');
var registerTable = require('../util/registerTable');
var config = require('../config/config');

const FILE_NAME = 'feed.txt';

// Load data in txt format and convert into array of string.

function loadModubusLiveFeedData() {
    const rawDataArr = fs
        .readFileSync(FILE_NAME, 'utf-8')
        .toString()
        .replace(/\r\n/g, '\n')
        .split('\n');
    
    convertRawDataIntoJson(rawDataArr);
}

// Parse Raw txt data and covert into JSON format.

function convertRawDataIntoJson(rawDataArr) {
    var cookedRegisterArr = [];

    let processedDataArr = rawDataArr.filter((x,i) => {return (i > 0) && x.length > 0}).map((value, index) => value.split(':'));
    
    var i = 0;
    do {
        let registerNumber = processedDataArr[i][0];
        if (typeof registerTable[registerNumber] !== 'undefined') {
            if (registerTable[registerNumber]["number"] == 1) {
                cookedRegisterArr.push({"register": `${processedDataArr[i][0]}`, "value": `${processedDataArr[i][1]}`, "unit": registerTable[registerNumber]["unit"], "name": registerTable[registerNumber]["varName"]});
                i += 1;
            } else if (registerTable[registerNumber]["number"] == 2) {
                cookedRegisterArr.push({"register": `${processedDataArr[i][0]}-${processedDataArr[i+1][0]}`, "value": `${processedDataArr[i][1]}-${processedDataArr[i+1][1]}`, "unit": registerTable[registerNumber]["unit"], "name": registerTable[registerNumber]["varName"]});
                i += 2;
            } else if (registerTable[registerNumber]["number"] == 3) {
                cookedRegisterArr.push({"register": `${processedDataArr[i][0]}-${processedDataArr[i+1][0]}-${processedDataArr[i+2][0]}`, "value": `${processedDataArr[i][1]}-${processedDataArr[i+1][1]}-${processedDataArr[i+2][1]}`, "unit": registerTable[registerNumber]["unit"], "name": registerTable[registerNumber]["varName"]});
                i += 3;
            }
        } else {
            i += 1;
        }
    }
    while (i < processedDataArr.length);
    
    var finalRegisterDataArr = {"data": cookedRegisterArr, "date": processedDataArr[0]};
    var registerJsonData = JSON.stringify(finalRegisterDataArr);
    saveJsonFile(registerJsonData);
}

function saveJsonFile(registerJsonData) {
    fs.writeFile(__dirname + config.jsonFile, registerJsonData, 'utf-8', function (err) {
        if (err) {
            console.log("failed to save")
        } else {
            console.log("succeeded in saving")
        }
    });
}

let task = cron.schedule('* */1 * * * *', () => {
    loadModubusLiveFeedData();
    console.log('running a task every two minutes');
});
  
module.exports = task;