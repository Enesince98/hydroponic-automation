import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { Calibration, HydroponicData, Limits, NutrientPump, RelayDevice, SensorData } from '../types';

@Injectable({
  providedIn: 'root',
})
export class MockSocketService {
  private subjects: { [key: string]: Subject<any> } = {};
  private mockData: HydroponicData;

  constructor() {
    // Initialize mock data
    this.mockData = {
      phLimits: { min: 5.5, max: 6.5, target: 6.0, delta: 0.2 },
      ecLimits: { min: 1.0, max: 2.0, target: 1.5, delta: 0.1 },
      phCalibration: { slope: 1.0, intercept: 0 },
      phUpPump: { lastRun: 0, duration: 0, isRunning: false, isNegative: false, totalRunCount: 0 },
      phDownPump: { lastRun: 0, duration: 0, isRunning: false, isNegative: false, totalRunCount: 0 },
      ecPump: { lastRun: 0, duration: 0, isRunning: false, isNegative: false, totalRunCount: 0 },
      waterPump: { lastToggle: 0, onTime: 300000, offTime: 300000, state: false, totalRunCount: 0 },
      lightSource: { lastToggle: 0, onTime: 43200000, offTime: 43200000, state: false, totalRunCount: 0 },
      sensors: { ec: 1.5, ph: 6.0 },
      environmentalData: {
        waterTemp: 22,
        environmentTemp: 24,
        humidity: 60,
        lightLevel: 500
      }
    };

    // Initialize subjects for each data type
    ['pl', 'el', 'pc', 'pup', 'pdp', 'ep', 'wp', 'ls', 's', 'ed'].forEach(key => {
      this.subjects[key] = new Subject();
    });

    // Start periodic updates
    this.startPeriodicUpdates();
  }

  private startPeriodicUpdates() {
    // Update all data every 5 seconds
    timer(0, 5000).subscribe(() => {
      this.updateAllData();
    });
  }

  private updateAllData() {
    const now = Date.now();

    // Update sensor data with small variations
    this.mockData.sensors.ph += (Math.random() - 0.5) * 0.1;
    this.mockData.sensors.ec += (Math.random() - 0.5) * 0.05;
    this.mockData.sensors.ph = Math.max(4, Math.min(8, this.mockData.sensors.ph));
    this.mockData.sensors.ec = Math.max(0.5, Math.min(3, this.mockData.sensors.ec));
    this.subjects['s'].next(this.mockData.sensors);

    // Update environmental data with small variations
    this.mockData.environmentalData.waterTemp += (Math.random() - 0.5) * 0.2;
    this.mockData.environmentalData.environmentTemp += (Math.random() - 0.5) * 0.3;
    this.mockData.environmentalData.humidity += (Math.random() - 0.5) * 1;
    this.mockData.environmentalData.lightLevel += (Math.random() - 0.5) * 10;
    
    // Keep environmental values within reasonable ranges
    this.mockData.environmentalData.waterTemp = Math.max(18, Math.min(28, this.mockData.environmentalData.waterTemp));
    this.mockData.environmentalData.environmentTemp = Math.max(20, Math.min(30, this.mockData.environmentalData.environmentTemp));
    this.mockData.environmentalData.humidity = Math.max(40, Math.min(80, this.mockData.environmentalData.humidity));
    this.mockData.environmentalData.lightLevel = Math.max(0, Math.min(1000, this.mockData.environmentalData.lightLevel));
    this.subjects['ed'].next(this.mockData.environmentalData);

    // Update pump states
    // pH up pump
    if (this.mockData.phUpPump.isRunning && now - this.mockData.phUpPump.lastRun > this.mockData.phUpPump.duration) {
      this.mockData.phUpPump.isRunning = false;
      this.mockData.phUpPump.totalRunCount++;
    }
    this.subjects['pup'].next(this.mockData.phUpPump);

    // pH down pump
    if (this.mockData.phDownPump.isRunning && now - this.mockData.phDownPump.lastRun > this.mockData.phDownPump.duration) {
      this.mockData.phDownPump.isRunning = false;
      this.mockData.phDownPump.totalRunCount++;
    }
    this.subjects['pdp'].next(this.mockData.phDownPump);

    // EC pump
    if (this.mockData.ecPump.isRunning && now - this.mockData.ecPump.lastRun > this.mockData.ecPump.duration) {
      this.mockData.ecPump.isRunning = false;
      this.mockData.ecPump.totalRunCount++;
    }
    this.subjects['ep'].next(this.mockData.ecPump);

    // Update water pump state
    if (now - this.mockData.waterPump.lastToggle > (this.mockData.waterPump.state ? this.mockData.waterPump.onTime : this.mockData.waterPump.offTime)) {
      this.mockData.waterPump.state = !this.mockData.waterPump.state;
      this.mockData.waterPump.lastToggle = now;
      this.mockData.waterPump.totalRunCount++;
    }
    this.subjects['wp'].next(this.mockData.waterPump);

    // Update light source state
    if (now - this.mockData.lightSource.lastToggle > (this.mockData.lightSource.state ? this.mockData.lightSource.onTime : this.mockData.lightSource.offTime)) {
      this.mockData.lightSource.state = !this.mockData.lightSource.state;
      this.mockData.lightSource.lastToggle = now;
      this.mockData.lightSource.totalRunCount++;
    }
    this.subjects['ls'].next(this.mockData.lightSource);

    // Emit limits and calibration data
    this.subjects['pl'].next(this.mockData.phLimits);
    this.subjects['el'].next(this.mockData.ecLimits);
    this.subjects['pc'].next(this.mockData.phCalibration);

    // Log the update
    console.log('Mock data updated:', {
      timestamp: new Date().toISOString(),
      sensors: this.mockData.sensors,
      environmental: this.mockData.environmentalData,
      pumps: {
        phUp: this.mockData.phUpPump,
        phDown: this.mockData.phDownPump,
        ec: this.mockData.ecPump
      },
      devices: {
        waterPump: this.mockData.waterPump,
        lightSource: this.mockData.lightSource
      }
    });
  }

  // ----- SENDERS -----
  sendLimits(limits: Limits[]): Observable<any> {
    console.log("Mock: Sending pH-EC limits:", limits);
    this.mockData.phLimits = limits[0];
    this.mockData.ecLimits = limits[1];
    this.subjects['pl'].next(this.mockData.phLimits);
    this.subjects['el'].next(this.mockData.ecLimits);
    return new Observable(observer => {
      observer.next({ status: 'ok', receivedAt: Date.now() });
      observer.complete();
    });
  }

  sendNutrientPumpsDurations(data: { duration: number[] }): Observable<any> {
    console.log("Mock: Sending nutrient pump durations:", data);
    this.mockData.phUpPump.duration = data.duration[0];
    this.mockData.phDownPump.duration = data.duration[1];
    this.mockData.ecPump.duration = data.duration[2];
    return new Observable(observer => {
      observer.next({ status: 'ok', receivedAt: Date.now() });
      observer.complete();
    });
  }

  sendWaterPumpTimes(data: { onTime: number; offTime: number }): Observable<any> {
    console.log("Mock: Sending water pump times:", data);
    this.mockData.waterPump.onTime = data.onTime;
    this.mockData.waterPump.offTime = data.offTime;
    return new Observable(observer => {
      observer.next({ status: 'ok', receivedAt: Date.now() });
      observer.complete();
    });
  }

  sendLightSourceTimes(data: { onTime: number; offTime: number }): Observable<any> {
    console.log("Mock: Sending light source times:", data);
    this.mockData.lightSource.onTime = data.onTime;
    this.mockData.lightSource.offTime = data.offTime;
    return new Observable(observer => {
      observer.next({ status: 'ok', receivedAt: Date.now() });
      observer.complete();
    });
  }

  // ----- RECEIVERS -----
  onPhLimits(): Observable<Limits> {
    return this.subjects['pl'].asObservable();
  }

  onEcLimits(): Observable<Limits> {
    return this.subjects['el'].asObservable();
  }

  onPhCalibration(): Observable<Calibration> {
    return this.subjects['pc'].asObservable();
  }

  onPhUpPump(): Observable<NutrientPump> {
    return this.subjects['pup'].asObservable();
  }

  onPhDownPump(): Observable<NutrientPump> {
    return this.subjects['pdp'].asObservable();
  }

  onEcPump(): Observable<NutrientPump> {
    return this.subjects['ep'].asObservable();
  }

  onWaterPump(): Observable<RelayDevice> {
    return this.subjects['wp'].asObservable();
  }

  onLightSource(): Observable<RelayDevice> {
    return this.subjects['ls'].asObservable();
  }

  onSensors(): Observable<SensorData> {
    return this.subjects['s'].asObservable();
  }

  onEnvironmentalData(): Observable<HydroponicData['environmentalData']> {
    return this.subjects['ed'].asObservable();
  }

  onDashboardData(): Observable<HydroponicData> {
    return new Observable(observer => {
      observer.next(this.mockData);
    });
  }
} 