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
  sendLimits(limits: Limits[]): Observable<any> {
    console.log("Sending pH-EC limits to Arduino:", limits);
    return this.sendDataToArduino(limits, "updateLimits");
  }

  sendNutrientPumpsDurations(data: { duration: number[] }): Observable<any> {
    return this.sendDataToArduino(data, "updateNutrientPumps");
  }

  sendWaterPumpTimes(data: { onTime: number; offTime: number }): Observable<any> {
    return this.sendDataToArduino(data, "updatewp");
  }

  sendLightSourceTimes(data: { onTime: number; offTime: number }): Observable<any> {
    return this.sendDataToArduino(data, "updatels");
  }

  sendDataToArduino(data: { onTime: number; offTime: number } | Limits[] | number | {duration: number[]}, type: string): Observable<any> {
    console.log(`Sending data to Arduino with type ${type}:`, data);
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
      this.socket.on('pl', (data: Limits) => observer.next(data));
    });
  }

  onEcLimits(): Observable<Limits> {
    return new Observable((observer) => {
      this.socket.on('el', (data: Limits) => observer.next(data));
    });
  }

  onPhCalibration(): Observable<Calibration> {
    return new Observable((observer) => {
      this.socket.on('pc', (data: Calibration) => observer.next(data));
    });
  }

  onPhUpPump(): Observable<NutrientPump> {
    return new Observable((observer) => {
      this.socket.on('pup', (data: NutrientPump) => observer.next(data));
    });
  }

  onPhDownPump(): Observable<NutrientPump> {
    return new Observable((observer) => {
      this.socket.on('pdp', (data: NutrientPump) => observer.next(data));
    });
  }

  onEcPump(): Observable<NutrientPump> {
    return new Observable((observer) => {
      this.socket.on('ep', (data: NutrientPump) => observer.next(data));
    });
  }

  onWaterPump(): Observable<RelayDevice> {
    return new Observable((observer) => {
      this.socket.on('wp', (data: RelayDevice) => observer.next(data));
    });
  }

  onLightSource(): Observable<RelayDevice> {
    return new Observable((observer) => {
      this.socket.on('ls', (data: RelayDevice) => observer.next(data));
    });
  }

  onSensors(): Observable<SensorData> {
    return new Observable((observer) => {
      this.socket.on('s', (data: SensorData) => observer.next(data));
    });
  }

  onEnvironmentalData(): Observable<HydroponicData['environmentalData']> {
    return new Observable((observer) => {
      this.socket.on('ed', (data: HydroponicData['environmentalData']) => observer.next(data));
    });
  }

  onDashboardData(): Observable<HydroponicData> {
    return new Observable((observer) => {
      this.socket.on('dashboardData', (data: HydroponicData) => observer.next(data));
    });
  }
}