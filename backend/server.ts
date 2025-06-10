import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { HydroponicData, EmitFields, Limits } from './types';
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

httpServer.listen(3000, () => {
  console.log('Socket.IO sunucusu 3000 portunda çalışıyor.');
});

const port = new SerialPort({
  // path: '/dev/cu.usbserial-11420', // Windows "COM5"
  path: '/dev/cu.usbserial-110',
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (line: string) => {
  console.log(line);
  if (line.startsWith('#OUT')) {
    const jsonString = line.replace('#OUT', '');
    try {
      const data: HydroponicData = JSON.parse(jsonString);

      for (const key of EmitFields) {
        const value = data[key];
        if (value !== undefined) {
          io.emit(key, value);
          console.log(`Gönderilen veri: ${key}`, value);
        }
      }

    } catch (err) {
      console.error('JSON parse hatası:', err);
    }
  }
});

port.on('open', () => {
  console.log('Seri port bağlantısı açıldı.');
});

port.on('error', (err) => {
  console.error('Seri port hatası:', err);
});

io.on('connection', (socket) => {
  console.log(`İstemci bağlandı: ${socket.id}`);

  // 1. pH-EC limits
  socket.on('updateLimits', (limits :  Limits[], callback) => {
    if (limits.every((i) => validateLimits(i))) {
      port.write(JSON.stringify({ pl: limits[0] }) + '\n', (err) => errorHandler(err));
      setTimeout(() => {
        port.write(JSON.stringify({ el: limits[1] }) + '\n', (err) => errorHandler(err));
      }, 1000);
      
      callback({ status: 'ok', receivedAt: Date.now() });
    }
  });

  // 3. pH up/down/ec pumps duration
    socket.on(`updateNutrientPumps`, (payload: {duration: number[]}, callback) => {
      if (!Array.isArray(payload?.duration) || payload.duration.length !== 3) {
        return callback({ status: 'error', message: 'Invalid duration format' });
      }
        const jsonToSend = {
          pup: { d: payload.duration[0] },
          pdp: { d: payload.duration[1] },
          ep: { d: payload.duration[2] }
        };
        port.write(JSON.stringify(jsonToSend) + '\n', (err) => errorHandler(err));
        callback({ status: 'ok', receivedAt: Date.now() });
    });

  // 4. Water/light onTime-offTime
  ['wp', 'ls'].forEach((deviceKey) => {
    socket.on(
      `update${deviceKey}`, 
      (payload: { onTime: number; offTime: number }, callback) => {
      if (
        typeof payload?.onTime === 'number' &&
        typeof payload?.offTime === 'number'
      ) {
        port.write(JSON.stringify(
          { 
            [deviceKey]: { 
              onTime: payload.onTime, 
              offTime: payload.offTime 
            } 
          }
        ) + '\n', (err) => errorHandler(err));
        callback({ status: 'ok', receivedAt: Date.now() });
      }
    });
  });
});

function errorHandler(err: any) {
  if (err) {
    console.log('Error sending data to Arduino:', err);
  }
  port.drain(() => {
    console.log('Veri tamamen gönderildi.');
  });
}

function validateLimits(obj: any): obj is Limits {
  return (
    typeof obj.min === 'number' &&
    typeof obj.max === 'number' &&
    typeof obj.target === 'number' &&
    typeof obj.delta === 'number'
  );
}