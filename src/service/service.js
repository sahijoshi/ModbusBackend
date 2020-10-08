var http = require('http');
var config = require('../config/config');
var fs = require('fs');
var registerTable = require('../util/registerTable');
var { getRealValueForSignalQuality, getRealValueForTwoRegister } = require('../service/converter');

// Get data in txt format and convert into array of string.

const loadModbusData = function() { 
    http.get(config.modbusUrl, function(res){
        var str = '';
        console.log('Response is '+res.statusCode);

        res.on('data', function (chunk) {
               str += chunk;
         });

         // Parse data
        res.on('end', function () {

            // splits the txt data based on new line character and store in a array.
            const rawDataArr = str.split('\n');
            convertRawDataIntoJson(rawDataArr);
        });
  });
}

// Parse Raw txt data and covert into JSON format.

function convertRawDataIntoJson(rawDataArr) {
    var cookedRegisterArr = [];
    
    // split each data in array based on semiccolon ":"
    let processedDataArr = rawDataArr.filter((x,i) => {return (i > 0) && x.length > 0}).map((value, index) => value.split(':'));
    var index = 0;

    // Prepare coocked data, loop through all splitted data.
    do {
        // Scan through all process data
        let registerId = processedDataArr[index][0];
        if (typeof registerTable[registerId] !== 'undefined') { 

            // get number of register from register table
            let registerNumber = registerTable[registerId]["number"];

            // if only 1 register required based on Modbus table. For example, register 56 use 1 register
            if (registerNumber == 1) {
                cookedRegisterArr.push(getNewRegister(processedDataArr,registerId, registerNumber, index));
                index += 1;

            // if combination of 2 registers required. For example, register 1-2
            } else if (registerNumber == 2) {
                cookedRegisterArr.push(getNewRegister(processedDataArr, registerId, registerNumber, index));
                index += 2;

            // if combination of 3 registers required. For example, register 53-54
            } else if (registerNumber == 3) {
                cookedRegisterArr.push(getNewRegister(processedDataArr, registerId, registerNumber, index));
                index += 3;
            }
        } else {
            index += 1;
        }
    }
    while (index < processedDataArr.length);
    
    var finalRegisterDataArr = 
        {
        "date": rawDataArr[0], 
        "header_key": ["register", "variable_name", "unit", "register_value", "real_value"],
        "header_value": {"register": "Register", "variable_name": "Varaible Name", "unit": "Unit", "register_value": "Register Value", "real_value": "Real Value"},
        "data": cookedRegisterArr 
        };
    var registerJsonData = JSON.stringify(finalRegisterDataArr);

    // save json on disk
    saveJsonFile(registerJsonData);
}

function getNewRegister(processedDataArr, registerId, registerNumber, index) {
    var redableRegisterValue = "";
    var register = "";
    var registerValue = "";
    var dash = "";
    var tempIndex = index;
    for (var i = 0; i < registerNumber; i++) {
        register = register + dash + `${processedDataArr[tempIndex][0]}`;
        registerValue = registerValue + dash + `${processedDataArr[tempIndex][1]}`;
        dash = "-";
        tempIndex++;
    }

    if (registerNumber == 1) {
        let registerNumber = processedDataArr[index][0];
        // Handled conversion logic only for signal quality.
        // TODO: Handle for other registers and data types.
        if (registerNumber == 92) {
            let registerValue = processedDataArr[index][1];
            redableRegisterValue = getRealValueForSignalQuality(registerValue);
        }
    } else if (registerNumber == 2) {
        let format = registerTable[registerId]["format"];
        // Handled conversion login only for LONG format.
        // TODO: Handle for all other data format.
        if (format == "LONG") {
            let registerValue1 = processedDataArr[index][1];
            let registerValue2 = processedDataArr[index+1][1];
            redableRegisterValue = getRealValueForTwoRegister(registerValue1, registerValue2);
        }
    } 

    return {
        "register": register, 
        "register_value": registerValue, 
        "unit": registerTable[registerId]["unit"], 
        "variable_name": registerTable[registerId]["varName"], 
        "real_value": redableRegisterValue.toString()};
}

// Save json file to persistence folder used for response to the client

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