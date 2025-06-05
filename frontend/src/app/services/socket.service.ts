import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Calibration, HydroponicData, Limits, NutrientPump, RelayDevice, SensorData } from '../types';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  // ----- SENDERS -----
  sendPhLimits(limits: Limits): Observable<any> {
    return this.sendDataToArduino(limits, "updatePhLimits");
  }

  sendEcLimits(limits: Limits): Observable<any> {
    return this.sendDataToArduino(limits, "updateEcLimits");
  }

  sendPhUpPumpDuration(duration: number): Observable<any> {
    return this.sendDataToArduino(duration, "updatephUpPump");
  }

  sendPhDownPumpDuration(duration: number): Observable<any> {
    return this.sendDataToArduino(duration, "updatephDownPump");
  }

  sendEcPumpDuration(duration: number): Observable<any> {
    return this.sendDataToArduino(duration, "updateecPump");
  }

  sendWaterPumpTimes(data: { onTime: number; offTime: number }): Observable<any> {
    return this.sendDataToArduino(data, "updatewaterPump");
  }

  sendLightSourceTimes(data: { onTime: number; offTime: number }): Observable<any> {
    return this.sendDataToArduino(data, "updatelightSource");
  }

  sendDataToArduino(data: { onTime: number; offTime: number } | Limits | number, type: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.emit(type, data, (response: any) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  // ----- RECEIVERS -----
  onPhLimits(): Observable<Limits> {
    return new Observable((observer) => {
      this.socket.on('phLimits', (data: Limits) => observer.next(data));
    });
  }

  onEcLimits(): Observable<Limits> {
    return new Observable((observer) => {
      this.socket.on('ecLimits', (data: Limits) => observer.next(data));
    });
  }

  onPhCalibration(): Observable<Calibration> {
    return new Observable((observer) => {
      this.socket.on('phCalibration', (data: Calibration) => observer.next(data));
    });
  }

  onPhUpPump(): Observable<NutrientPump> {
    return new Observable((observer) => {
      this.socket.on('phUpPump', (data: NutrientPump) => observer.next(data));
    });
  }

  onPhDownPump(): Observable<NutrientPump> {
    return new Observable((observer) => {
      this.socket.on('phDownPump', (data: NutrientPump) => observer.next(data));
    });
  }

  onEcPump(): Observable<NutrientPump> {
    return new Observable((observer) => {
      this.socket.on('ecPump', (data: NutrientPump) => observer.next(data));
    });
  }

  onWaterPump(): Observable<RelayDevice> {
    return new Observable((observer) => {
      this.socket.on('waterPump', (data: RelayDevice) => observer.next(data));
    });
  }

  onLightSource(): Observable<RelayDevice> {
    return new Observable((observer) => {
      this.socket.on('lightSource', (data: RelayDevice) => observer.next(data));
    });
  }

  onSensors(): Observable<SensorData> {
    return new Observable((observer) => {
      this.socket.on('sensors', (data: SensorData) => observer.next(data));
    });
  }

  onDashboardData(): Observable<HydroponicData> {
    return new Observable((observer) => {
      this.socket.on('dashboardData', (data: HydroponicData) => observer.next(data));
    });
  }
}