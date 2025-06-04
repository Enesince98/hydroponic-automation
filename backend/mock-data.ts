import { MockBinding, MockPortBinding } from '@serialport/binding-mock';
import { SerialPort } from 'serialport';

const path = '/dev/ROBOT';

// 1. Port oluştur
MockBinding.createPort(path, { echo: true, record: true });

// 2. Portu aç
const port = new SerialPort({
  path,
  baudRate: 9600,
  binding: new MockBinding() as unknown as SerialPort.Binding,
});

// 3. Fake JSON üretici
function generateFakeData() {
  return {
    phLimits: { min: 5.5, max: 6.5, target: 6, delta: 0.3 },
    ecLimits: { min: 1.2, max: 1.8, target: 1.5, delta: 0.2 },
    phCalibration: { slope: -23.4946, intercept: 37.8842 },
    phUpPump: {
      lastRun: 0,
      duration: 5000,
      isRunning: false,
      isNegative: false,
      totalRunCount: 0
    },
    phDownPump: {
      lastRun: Date.now() % 10000,
      duration: 5000,
      isRunning: false,
      isNegative: true,
      totalRunCount: 1
    },
    ecPump: {
      lastRun: Date.now() % 10000,
      duration: 5000,
      isRunning: false,
      isNegative: false,
      totalRunCount: 1
    },
    waterPump: {
      lastToggle: 0,
      onTime: 10000,
      offTime: 60000,
      state: false,
      totalRunCount: 0
    },
    lightSource: {
      lastToggle: 0,
      onTime: 57600000,
      offTime: 28800000,
      state: false,
      totalRunCount: 0
    },
    sensors: {
      ec: +(1.2 + Math.random() * 0.6).toFixed(4),
      ph: +(5.5 + Math.random() * 1).toFixed(4)
    }
  };
}

// 4. Veriyi port'a gönder
setInterval(() => {
  const fakeJson = JSON.stringify(generateFakeData()) + '\n';
  const mockPort = MockBinding.getPort(path) as MockPortBinding;
  mockPort.emitData(fakeJson);
}, 5000);

console.log(`✅ Mock veri kaynağı başladı: ${path}`);