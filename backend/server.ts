const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", //only when no internet connection
    // origin: ['http://192.168.1.155:4200', 'http://localhost:4200'], // Allow requests from Angular frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }
});

enum DataTypes {
  SENSOR_DATA = "sensorData",
  PUMP_STATUS_DATA = "pumpStatusData",
  SENSOR_RANGE_DATA = "sensorRangeData",
  PH_CALIBRATION_DATA = "phCalibrationData",
  WATER_PUMP_DATA = "waterPumpData",
  LIGHT_SOURCE_DATA = "lightSourceData",
}

interface SerialData {
  type: string,
}

interface SensorData extends SerialData {
  ph: number,
  ec: number,
  temp: number,
  hum: number,
  lux: number
}

interface PumpStatusData extends SerialData {
  ecPump: boolean,
  phUpPump: boolean,
  phDownPump: boolean,
}

interface SensorRangeData extends SerialData {
  maxEc: number,
  minEc: number,
  targetEc: number,
  maxPh: number,
  minPh: number,
  targetPh: number,
}

interface PhCalibrationData extends SerialData {
  phVoltage: number,
  phValue: number,
}

interface WaterPumpData extends SerialData {
  offTime: number,
  onTime: number,
}

interface LightSourceData extends SerialData {
  offTime: number,
  onTime: number,
}

const path = 'COM5';
// const path = '/dev/ttyUSB0';

// Setup serial port
const port = new SerialPort({ path, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Handle sensor data
parser.on('data', (line) => {
  // console.log(line);
  const data: SensorData | SensorRangeData | PumpStatusData = JSON.parse(line);
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
io.on('connection', (socket) => {
  // Listen for pump control commands

  socket.emit('data', { type: 'status', message: 'Connected to server' });

  // Listen for pH/EC target changes from the frontend
  socket.on('setTargets', (targets) => socketSendData(targets));

  socket.on('phValueCalibration', (calibration_values) => socketSendData(calibration_values))

  socket.on('startPhCalibration', () => socketSendData({ type: "startPhCalibration" }))

});

function socketSendData(data: any) {
  {
    console.log(`Received new data: ${JSON.stringify(data)}`);

    // Send the new target values to Arduino

    port.write(`${JSON.stringify(data)}\n`, (err) => {
      if (err) {
        console.log('Error sending data to Arduino:', err);
      } else {
        console.log('Sent data to Arduino');
      }
    });
    port.drain(() => {
      console.log('Veri tamamen gönderildi.');
    });
  }
}

app.use(express.static('public'));

server.listen(3000, "0.0.0.0", () => {
  console.log('Server running on http://192.168.1.155:3000');
});

app.use(cors({
  origin: "*", //only when no internet connection
  //origin: ['http://192.168.1.155:4200', 'http://localhost:4200'], // Allow requests from Angular frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
})); 105