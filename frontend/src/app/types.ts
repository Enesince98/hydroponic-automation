export interface Limits {
  min: number;
  max: number;
  target: number;
  delta: number;
}

export interface Calibration {
  slope: number;
  intercept: number;
}

export interface NutrientPump {
  lastRun: number;
  duration: number;
  isRunning: boolean;
  isNegative: boolean;
  totalRunCount: number;
}

export interface RelayDevice {
  lastToggle: number;
  onTime: number;
  offTime: number;
  state: boolean;
  totalRunCount: number;
}

export interface SensorData {
  ec: number;
  ph: number;
}

export interface HydroponicData {
  phLimits: Limits;
  ecLimits: Limits;
  phCalibration: Calibration;
  phUpPump: NutrientPump;
  phDownPump: NutrientPump;
  ecPump: NutrientPump;
  waterPump: RelayDevice;
  lightSource: RelayDevice;
  sensors: SensorData;
}

export const EmitFields: (keyof HydroponicData)[] = [
  'sensors',
  'phLimits',
  'ecLimits',
  'phUpPump',
  'phDownPump',
  'ecPump',
  'waterPump',
  'lightSource',
];