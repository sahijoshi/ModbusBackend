var http = require('http');
var config = require('../config/config');
var fs = require('fs');
var registerTable = require('../util/registerTable');

// Load data in txt format and convert into array of string.

const loadModbusData = function() { 
    http.get(config.modbusUrl, function(res){
        var str = '';
        console.log('Response is '+res.statusCode);

        res.on('data', function (chunk) {
               str += chunk;
         });

        res.on('end', function () {
            const rawDataArr = str.split('\n');
            convertRawDataIntoJson(rawDataArr);
        });

  });
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
                cookedRegisterArr.push({"register": `${processedDataArr[i][0]}`, "regiter_value": `${processedDataArr[i][1]}`, "unit": registerTable[registerNumber]["unit"], "variable_name": registerTable[registerNumber]["varName"]});
                i += 1;
            } else if (registerTable[registerNumber]["number"] == 2) {
                cookedRegisterArr.push({"register": `${processedDataArr[i][0]}-${processedDataArr[i+1][0]}`, "regiter_value": `${processedDataArr[i][1]}-${processedDataArr[i+1][1]}`, "unit": registerTable[registerNumber]["unit"], "variable_name": registerTable[registerNumber]["varName"]});
                i += 2;
            } else if (registerTable[registerNumber]["number"] == 3) {
                cookedRegisterArr.push({"register": `${processedDataArr[i][0]}-${processedDataArr[i+1][0]}-${processedDataArr[i+2][0]}`, "regiter_value": `${processedDataArr[i][1]}-${processedDataArr[i+1][1]}-${processedDataArr[i+2][1]}`, "variable_name": registerTable[registerNumber]["unit"], "name": registerTable[registerNumber]["varName"]});
                i += 3;
            }
        } else {
            i += 1;
        }
    }
    while (i < processedDataArr.length);
    
    var finalRegisterDataArr = 
        {
        "date": rawDataArr[0], 
        "header_key": ["register", "variable_name", "unit", "regiter_value", "real_value"],
        "header_value": {"register": "Register", "variable_name": "Varaible Name", "unit": "Unit", "regiter_value": "Register Value", "real_value": "Real Value"},
        "data": cookedRegisterArr 
        };
    var registerJsonData = JSON.stringify(finalRegisterDataArr);
    console.log(registerJsonData);
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

module.exports = loadModbusData;