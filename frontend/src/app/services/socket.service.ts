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
    this.socket = io('http://localhost:3000'); // Backend adresin buraya
  }

  // ----- VERİ GÖNDERİCİLER -----
  sendPhLimits(data: Limits) {
    this.socket.emit('updatePhLimits', data);
  }

  sendEcLimits(data: Limits) {
    this.socket.emit('updateEcLimits', data);
  }

  sendPhUpPumpDuration(duration: number) {
    this.socket.emit('updatephUpPump', duration);
  }

  sendPhDownPumpDuration(duration: number) {
    this.socket.emit('updatephDownPump', duration);
  }

  sendEcPumpDuration(duration: number) {
    this.socket.emit('updateecPump', duration);
  }

  sendWaterPumpTimes(data: { onTime: number; offTime: number }) {
    this.socket.emit('updatewaterPump', data);
  }

  sendLightSourceTimes(data: { onTime: number; offTime: number }): Observable<any> {
    return new Observable<any>((observer) => { 
      this.socket.emit('updatelightSource', data, (response: any) => {
        observer.next(response);   // Sunucudan gelen yanıtı döndür
        observer.complete();       // Observable tamamlandı
    });
  });
  }

  // ----- VERİ ALICILAR -----
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