# ModbusBackend
Node.js backend for handling Modbus txt data.

# The Need
 
This is a backend repository created for providing Modbus data to the frontend client in JSON format. The backend is created in Node.js. The purpose of this repository is to get [Modbus live feed](http://tuftuf.gambitlabs.fi/feed.txt) data which is in txt format. Node.js backend does needful heavy operations on raw txt like parsing data, converting it into standard JSON format as per required by the frontend client app, and saving it. The backend has been hosted on [heroku](http://heroku.com/). Here, a cron-job has been set up which retrieves raw data from Modbus at a certain interval of time, parses the raw txt data, and saves it on disk in json format (in real world, it's better to save data in database). So, the client app does not have to do any heavy processing of the data. The client app can justs get a lightweight json data, parse it and display it.

# Technology Used
- Programming Language: JavaScript
- Node.js: Version 14.5.0
- Hosted on: [Heroku](http://heroku.com/)

# Requirement
- Node.js: Version 14.5.0
- Node Package Manager (npm)

# Installation
- Download from repository.
- Make sure node.js and npm is installed.
- Browse inside the project folder in the terminal and run “npm install” command. This installs required dependencies.
- To run the project, run “node index.js"

# API
The Modbus JSON data can be accessed with GET request.

- In local machine: http://localhost:3000/modbus
- Hosted on Heroku: https://modbus-prod.herokuapp.com/modbus

#### Example
- JSON Response: The API returns JSON response with http GET request which is as follows:
```bash
{
    "date": "2018-08-03 04:06",
    "header_key": [
        "register",
        "variable_name",
        "unit",
        "register_value",
        "real_value"
    ],
    "header_value": {
        "register": "Register",
        "variable_name": "Varaible Name",
        "unit": "Unit",
        "register_value": "Register Value",
        "real_value": "Real Value"
    },
    "data": [
        {
            "register": "1-2",
            "register_value": "63647-15846",
            "unit": "m3/h",
            "variable_name": "Flow Rate",
            "real_value": ""
        },
        {
            "register": "3-4",
            "register_value": "37438-47954",
            "unit": "GJ/h",
            "variable_name": "Energy Flow Rate",
            "real_value": ""
        }, ... more items
    ]
}
```
# Implementation
### High Level Algorithm
- Get data from Modbus live feed data in txt format at certain interval of time using cron-job
- Parse txt data.
- Save the retrieved data on disk in json format.
- When frontend requests data, send cooked data as json response.

#### Cron-job
- A cron-job has been setup which runs at specific interval of time. The cron-job interval can be setup depending upon how frequent Modbus data is available.

#### Code
```bash
// Cron job set to time interval of 2 min

let task = cron.schedule('* 2 * * * *', () => {
    loadModbusData();
});
```

### Get txt data from Modbus
- Node.js request Modbuse data through url "http://tuftuf.gambitlabs.fi/feed.txt". service.js -> loadModbusData function is responsible for this task.

### Parse txt data
1)  Download raw txt data and split the contents based on "\n" new line character into array.

#### Code Parse
 ```bash
 // get data in txt format and convert into array of string.

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
 ```
#### Output
```bash
[
  '2018-08-03 04:06', '1:63647',  '2:15846',  '3:37438',
  '4:47954',          '5:19407',  '6:15737',  '7:8874',
  '8:17584',          '9:23',     '10:0',     '11:13971',
  '12:16225',         '13:0',     '14:0',     '15:0',
  ... more items
]
```
#### Code Parse Continue...
2) The data in first index is "date" which can be extracted easily by accessing first index data in an array.
3) For remaining data split each data based on semicolon ":"
```bash
    let processedDataArr = rawDataArr.filter((x,i) => {return (i > 0) && x.length > 0}).map((value, index) => value.split(':'));
```
#### Output
```bash
[
  [ '1', '63647' ],  [ '2', '15846' ],  [ '3', '37438' ],  [ '4', '47954' ],
  [ '5', '19407' ],  [ '6', '15737' ],  [ '7', '8874' ],   [ '8', '17584' ] ... more items
]
Here first index is register number, last is the register value.
```
#### Code Parse Continue...
4) Based on Modbus register documentation [docs/tuf-2000m.pdf](https://github.com/gambit-labs/challenge/blob/master/docs/tuf-2000m.pdf). I have mapped "Modbus Register Table" into JavaScript Objects so that I can get required value based on register number. It's maintained in registerTable.js as follows:
```bash
const registerTable = {
    "1": {
        "number": 2, // this is number of register i.e 1,2 or 3 (1-2 -> 2, 56 -> 1 from Modbus register table)
        "varName": "Flow Rate",
        "format": "REAL4",
        "unit": "m3/h",
        "realValue": ""
    },
    "3": {
        "number": 2,
        "varName": "Energy Flow Rate",
        "format": "REAL4",
        "unit": "GJ/h",
        "realValue": ""
    },
    "5": {
        "number": 2,
        "varName": "Velocity",
        "format": "REAL4",
        "unit": "m/s",
        "realValue": ""
    }, ... more items
```
5) Loop through all splitted data and prepare coocked final json data as shown below in code.
#### Code Parse Continue...
```bash
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
```
#### Final JSON Output
```bash
```bash
{
    "date": "2018-08-03 04:06",
    "header_key": [
        "register",
        "variable_name",
        "unit",
        "register_value",
        "real_value"
    ],
    "header_value": {
        "register": "Register",
        "variable_name": "Varaible Name",
        "unit": "Unit",
        "register_value": "Register Value",
        "real_value": "Real Value"
    },
    "data": [
        {
            "register": "1-2",
            "register_value": "63647-15846",
            "unit": "m3/h",
            "variable_name": "Flow Rate",
            "real_value": ""
        },
        {
            "register": "3-4",
            "register_value": "37438-47954",
            "unit": "GJ/h",
            "variable_name": "Energy Flow Rate",
            "real_value": ""
        }, ... more items
     ]
 }
```
# Conversion to Human Readabale
I have tried to convert current register value to human readable value which has been done for "LONG" Data Format and Signal Quality -> register number 92, Integer. For REAL4 and other tried but no success, need more research. The conversion logic is implemented on converter.js.

## Logic for Conversion
#### LONG Format Logic
- First convert register value from decimal to binary 16 bit.
- Concat binary value of both registers.
- Retrieve decimal from concatednated binary values.

#### Code
```bash
/**
 * Convert decimal to 16 bit binary.
 */

const decbin = nbr => {
    if(nbr < 0){
       nbr = 0xFFFFFFFF + nbr + 1;
    }
    return ("0000000000000000" + parseInt(nbr, 10).toString(2)).substr(-16);
};

/**
 * Handle conversion to real value for 2 register value.
 */

const getRealValueForTwoRegister = (reg1, reg2) => {
    let register1 = parseInt(reg1);
    let register2 = parseInt(reg2);

   return ~~parseInt(decbin(register2)+decbin(register1),2);
};
```
## Signal Quality Conversion
- Convert register value to 16 bit binary.
- Convert low byte of binary into decimal.
#### Code
```bash
/**
 * Handle conversion to real value for signal quality for register number 92.
 */

const getRealValueForSignalQuality = (reg) => {
    let registerValue = parseInt(reg);
    
    // return low byte for signal quality.
    return registerValue & 0xff; 
};
```
# Deployment
- The backend has been deployed and hosted on Heroku. Its a PaaS service supports different programming language.


