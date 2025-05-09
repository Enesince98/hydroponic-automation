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
    origin: ['http://192.168.1.105:4200', 'http://localhost:4200'],  // Allow requests from Angular frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }
});

enum DataTypes {
  SENSOR_DATA = "sensorData",
  PUMP_STATUS_DATA = "pumpStatusData",
  SENSOR_RANGE_DATA = "sensorRangeData",
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

// Setup serial port
const port = new SerialPort({ path: 'COM5', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Handle sensor data
parser.on('data', (line) => {
  console.log(line);
  const data: SensorData | SensorRangeData | PumpStatusData = JSON.parse(line);
  switch (data.type) {
    case DataTypes.PUMP_STATUS_DATA:
      console.log(data);
      io.emit(DataTypes.PUMP_STATUS_DATA, data);
      break;
    case DataTypes.SENSOR_DATA:
      console.log(data);
      io.emit(DataTypes.SENSOR_DATA, data);
      break;
    case DataTypes.SENSOR_RANGE_DATA:
      console.log(data);
      io.emit(DataTypes.SENSOR_RANGE_DATA, data);
      break;
    default:
      console.log(line);
      break;
  }
});

// Handle pump control commands from the frontend
io.on('connection', (socket) => {
  // Listen for pump control commands

  socket.emit('data', { type: 'status', message: 'Connected to server' });


  socket.on('pumpControl', (commands) => {
    console.log(`Received pump control command: ${JSON.stringify(commands)}`);

    // Send the command to Arduino
    // port.write(command, (err) => {
    //   if (err) {
    //     console.log('Error sending command to Arduino:', err);
    //   } else {
    //     console.log(`Sent command to Arduino: ${command}`);
    //   }
    // });
  });

  // Listen for pH/EC target changes from the frontend
  socket.on('setTargets', (targets) => {
    console.log(`Received new target values: ${JSON.stringify(targets)}`);

    // Send the new target values to Arduino

    port.write(`${JSON.stringify(targets)}\n`, (err) => {
      if (err) {
        console.log('Error sending targets to Arduino:', err);
      } else {
        console.log('Sent target values to Arduino');
      }
    });
    port.drain(() => {
      console.log('Veri tamamen gönderildi.');
    });
  });
});

app.use(express.static('public'));

server.listen(3000, "0.0.0.0", () => {
  console.log('Server running on http://192.168.1.105:3000');
});

app.use(cors({
  origin: ['http://192.168.1.105:4200', 'http://localhost:4200'],  // Allow requests only from your Angular app
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));