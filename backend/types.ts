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

export interface EnvironmentalData {
  waterTemp: number;
  environmentTemp: number;
  humidity: number;
  lightLevel: number;
}

export interface HydroponicData {
  pl: Limits;
  el: Limits;
  pc: Calibration;
  pup: NutrientPump;
  pdp: NutrientPump;
  ep: NutrientPump;
  wp: RelayDevice;
  ls: RelayDevice;
  s: SensorData;
  ed: EnvironmentalData;
}

export const EmitFields: (keyof HydroponicData)[] = [
  'pl', // phLimits
  'el', // ecLimits
  'pup', // phUpPump
  'pdp', // phDownPump
  'ep', // ecPump
  'wp', // waterPump
  'ls', // lightSource
  's', // sensors
  'ed', // environmentalData
];