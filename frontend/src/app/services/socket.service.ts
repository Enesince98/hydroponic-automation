// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export interface SensorData {
  type: string,
  ph: number,
  ec: number,
  temp: number,
  lux: number,
  hum: number,
}

export interface SensorRangeData {
  type: string,
  maxEc: number,
  minEc: number,
  targetEc: number,
  maxPh: number,
  minPh: number,
  targetPh: number,
}

export interface WaterPumpData {
  type: string,
  onTime: number,
  offTime: number,
}

export interface LightSourceData {
  type: string,
  onTime: number,
  offTime: number,
}


export interface PumpStatusData {
  phUpPump: boolean,
  phDownPump: boolean,
  ecPump: boolean,
  intervalBetweenPumpRun: number,
  pumpDuration: number,
  type: string,
}

export interface ReceivedPhCalibrationData {
  phVoltage: number,
  phValue: number,
  type: string,
}

export interface SetPhCalibrationData {
  phSlope: number,
  phOffset: number,
  type: string,
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    // this.socket = io('http://192.168.1.105:3000'); // adjust if needed
    this.socket = io('http://localhost:3000'); // if no internet connectoin
  }

  onSensorData(): Observable<SensorData> {
    return new Observable(observer => {
      const handler = (data: SensorData) => {
        console.log(data);
        observer.next(data);
      };

      this.socket.on('sensorData', handler);

      // Cleanup function that runs on unsubscribe
      return () => {
        this.socket.off('sensorData', handler);
      };
    });
  }

  onPumpStatusData(): Observable<PumpStatusData> {
    return new Observable(observer => {
      const handler = (data: PumpStatusData) => {
        console.log(data);
        observer.next(data);
      };

      this.socket.on('pumpStatusData', handler);

      // Cleanup function that runs on unsubscribe
      return () => {
        this.socket.off('pumpStatusData', handler);
      };
    });
  }

  onSensorRangeData(): Observable<SensorRangeData> {
    return new Observable(observer => {
      const handler = (data: SensorRangeData) => {
        console.log(data);
        observer.next(data);
      };

      this.socket.on('sensorRangeData', handler);

      return () => {
        this.socket.off('sensorRangeData', handler);
      };
    });
  }

  onWaterPumpData(): Observable<WaterPumpData> {
    return new Observable(observer => {
      const handler = (data: WaterPumpData) => {
        console.log(data);
        observer.next(data);
      };

      this.socket.on('waterPumpData', handler);

      return () => {
        this.socket.off('waterPumpData', handler);
      };
    });
  }


  onLightSourceData(): Observable<LightSourceData> {
    return new Observable(observer => {
      const handler = (data: LightSourceData) => {
        console.log(data);
        observer.next(data);
      };

      this.socket.on('lightSourceData', handler);

      return () => {
        this.socket.off('lightSourceData', handler);
      };
    });
  }

  onPhCalibrationData(): Observable<ReceivedPhCalibrationData> {
    return new Observable(observer => {
      const handler = (data: ReceivedPhCalibrationData) => {
        console.log(data);
        observer.next(data);
      };

      this.socket.on('phCalibrationData', handler);

      // Cleanup function that runs on unsubscribe
      return () => {
        this.socket.off('phCalibrationData', handler);
      };
    });
  }

  onHistory(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('historyData', (data) => { console.log(data); return observer.next(data) });
    });
  }

  controlPump(pumps: Record<string, string | boolean | number>): void {
    console.log(`Sending command: ${JSON.stringify(pumps)}`);
    this.socket.emit('pumpControl', pumps); // Send to server via Socket.io
  }

  setTargets(key: string, value: number) {
    console.log({ [key]: value, type: "setSensorRangeData" });
    this.socket.emit('setTargets', { [key]: value, type: "setSensorRangeData" });
  }

  setWaterPumpTimings(waterPumpData: WaterPumpData) {
    console.log(waterPumpData);
    this.socket.emit('setTargets', waterPumpData);
  }

  setLightSourceTimings(lightSourceData: LightSourceData) {
    console.log(lightSourceData);
    this.socket.emit('setTargets', lightSourceData);
  }

  setPumpOptions(key: string, value: number) {
    console.log({ [key]: value, type: "setPumpOptions" });
    this.socket.emit('setTargets', { [key]: value, type: "setPumpOptions" });
  }

  setPhCalibration(phCalibrationData: SetPhCalibrationData) {
    console.log(phCalibrationData);
    this.socket.emit('phValueCalibration', { ...phCalibrationData, type: "setPhCalibration" });
  }

  startPhCalibration() {
    this.socket.emit('startPhCalibration');
  }


}
