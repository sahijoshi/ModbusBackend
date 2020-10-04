var http = require('http');
var config = require('../config/config');

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
        });

  });
}

module.exports = loadModbusData;