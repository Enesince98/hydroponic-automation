import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { HydroponicData, EmitFields, Limits} from './types';
// Seri portu tanımlamak için kullanılan binding
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' }, // frontend başka portta ise bu önemli
});

httpServer.listen(3000, () => {
  console.log('Socket.IO sunucusu 3000 portunda çalışıyor.');
});

// Seri port ayarları
const port = new SerialPort({
  path: '/dev/cu.usbserial-11420', // Windows'ta "COM3" gibi olabilir
  baudRate: 9600,
});

// Satır sonu karakterine göre ayrıştırıcı (JSON her satırda gönderiliyorsa)
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Veri alındığında işleyici
parser.on('data', (line: string) => {
  try {
    const data: HydroponicData = JSON.parse(line);

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
});

port.on('open', () => {
  console.log('Seri port bağlantısı açıldı.');
});

port.on('error', (err) => {
  console.error('Seri port hatası:', err);
});

io.on('connection', (socket) => {
  console.log(`İstemci bağlandı: ${socket.id}`);

  // 1. pH limitlerini güncelle
  socket.on('updatePhLimits', (limits: Limits) => {
    if (validateLimits(limits)) {
      port.write(JSON.stringify({ phLimits: limits }) + '\n');
      console.log('pH limitleri gönderildi:', limits);
    }
  });

  // 2. EC limitleri
  socket.on('updateEcLimits', (limits: Limits) => {
    if (validateLimits(limits)) {
      port.write(JSON.stringify({ ecLimits: limits }) + '\n');
      console.log('EC limitleri gönderildi:', limits);
    }
  });

  // 3. pH up/down/ec pompaları duration
  ['phUpPump', 'phDownPump', 'ecPump'].forEach((pumpKey) => {
    socket.on(`update${pumpKey}`, (duration: number) => {
      if (typeof duration === 'number' && duration > 0) {
        port.write(JSON.stringify({ [pumpKey]: { duration } }) + '\n');
        console.log(`${pumpKey} süresi gönderildi: ${duration}`);
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
        port.write(JSON.stringify({ [deviceKey]: payload }) + '\n');
        console.log(`${deviceKey} zamanları gönderildi:`, payload);
        callback({ status: 'ok', receivedAt: Date.now() });
      }
    });
  });
});

function validateLimits(obj: any): obj is Limits {
  return (
    typeof obj.min === 'number' &&
    typeof obj.max === 'number' &&
    typeof obj.target === 'number' &&
    typeof obj.delta === 'number'
  );
}