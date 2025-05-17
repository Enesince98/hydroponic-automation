var express = require('express');
var http = require('http');
var SerialPort = require('serialport').SerialPort;
var ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
var socketIo = require('socket.io');
var cors = require('cors');
var app = express();
var server = http.createServer(app);
var io = socketIo(server, {
    cors: {
        origin: "*", //only when no internet connection
        // origin: ['http://192.168.1.155:4200', 'http://localhost:4200'], // Allow requests from Angular frontend
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});
var DataTypes;
(function (DataTypes) {
    DataTypes["SENSOR_DATA"] = "sensorData";
    DataTypes["PUMP_STATUS_DATA"] = "pumpStatusData";
    DataTypes["SENSOR_RANGE_DATA"] = "sensorRangeData";
    DataTypes["PH_CALIBRATION_DATA"] = "phCalibrationData";
    DataTypes["WATER_PUMP_DATA"] = "waterPumpData";
    DataTypes["LIGHT_SOURCE_DATA"] = "lightSourceData";
})(DataTypes || (DataTypes = {}));
var path = 'COM5';
// const path = '/dev/ttyUSB0';
// Setup serial port
var port = new SerialPort({ path: path, baudRate: 9600 });
var parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
// Handle sensor data
parser.on('data', function (line) {
    // console.log(line);
    var data = JSON.parse(line);
    switch (data.type) {
        case DataTypes.PUMP_STATUS_DATA:
            io.emit(DataTypes.PUMP_STATUS_DATA, data);
            break;
        case DataTypes.SENSOR_DATA:
            io.emit(DataTypes.SENSOR_DATA, data);
            break;
        case DataTypes.SENSOR_RANGE_DATA:
            io.emit(DataTypes.SENSOR_RANGE_DATA, data);
            break;
        case DataTypes.PH_CALIBRATION_DATA:
            io.emit(DataTypes.PH_CALIBRATION_DATA, data);
            break;
        case DataTypes.WATER_PUMP_DATA:
            io.emit(DataTypes.WATER_PUMP_DATA, data);
            break;
        case DataTypes.LIGHT_SOURCE_DATA:
            io.emit(DataTypes.LIGHT_SOURCE_DATA, data);
            break;
        default:
            // console.log(line);
            break;
    }
});
// Handle pump control commands from the frontend
io.on('connection', function (socket) {
    // Listen for pump control commands
    socket.emit('data', { type: 'status', message: 'Connected to server' });
    // Listen for pH/EC target changes from the frontend
    socket.on('setTargets', function (targets) { return socketSendData(targets); });
    socket.on('phValueCalibration', function (calibration_values) { return socketSendData(calibration_values); });
    socket.on('startPhCalibration', function () { return socketSendData({ type: "startPhCalibration" }); });
});
function socketSendData(data) {
    {
        console.log("Received new data: ".concat(JSON.stringify(data)));
        // Send the new target values to Arduino
        port.write("".concat(JSON.stringify(data), "\n"), function (err) {
            if (err) {
                console.log('Error sending data to Arduino:', err);
            }
            else {
                console.log('Sent data to Arduino');
            }
        });
        port.drain(function () {
            console.log('Veri tamamen gönderildi.');
        });
    }
}
app.use(express.static('public'));
server.listen(3000, "0.0.0.0", function () {
    console.log('Server running on http://192.168.1.155:3000');
});
app.use(cors({
    origin: "*", //only when no internet connection
    //origin: ['http://192.168.1.155:4200', 'http://localhost:4200'], // Allow requests from Angular frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
105;
