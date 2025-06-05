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
  path: 'COM5',
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

  // 1. pH limits
  socket.on('updatePhLimits', (limits: Limits) => {
    if (validateLimits(limits)) {
      port.write(JSON.stringify({ phLimits: limits }) + '\n', (err) => errorHandler(err));
    }
  });

  // 2. EC limits
  socket.on('updateEcLimits', (limits: Limits) => {
    if (validateLimits(limits)) {
      port.write(JSON.stringify({ ecLimits: limits }) + '\n', (err) => errorHandler(err));
    }
  });

  // 3. pH up/down/ec pumps duration
  ['phUpPump', 'phDownPump', 'ecPump'].forEach((pumpKey) => {
    socket.on(`update${pumpKey}`, (duration: number) => {
      if (typeof duration === 'number' && duration > 0) {
        port.write(JSON.stringify({ [pumpKey]: { duration } }) + '\n', (err) => errorHandler(err));
      }
    });
  });

  // 4. Water/light onTime-offTime
  ['waterPump', 'lightSource'].forEach((deviceKey) => {
    socket.on(`update${deviceKey}`, (payload: { onTime: number; offTime: number }, callback) => {
      if (
        typeof payload?.onTime === 'number' &&
        typeof payload?.offTime === 'number'
      ) {
        port.write(JSON.stringify({ [deviceKey]: { onTime: payload.onTime, offTime: payload.offTime } }) + '\n', (err) => errorHandler(err));
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