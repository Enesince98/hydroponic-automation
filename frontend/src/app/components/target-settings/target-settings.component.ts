// src/app/components/target-settings/target-settings.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SensorRangeData, SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import isEqual from 'lodash/isEqual';
import { Subject, takeUntil } from 'rxjs';
enum Values {
  targetPh = "Target PH",
  targetEc = "Target EC",
  minPh = "Min PH",
  maxPh = "Max PH",
  minEc = "Min EC",
  maxEc = "Max EC",
}

@Component({
  selector: 'app-target-settings',
  templateUrl: './target-settings.component.html',
  imports: [LoaderComponent, CommonModule, FormsModule, MatLabel, MatFormField, MatCardContent, MatCardTitle, MatCardHeader, MatCard, MatInputModule, MatButtonModule, MatIcon],
  styleUrls: ['./target-settings.component.scss']
})
export class TargetSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  firstDataArrived = false;
  controlSensorRangeData = {} as SensorRangeData;
  values: { [key: string]: { min: number; max: number; target: number } } = {
    Ph: { min: 0, max: 0, target: 0 },
    Ec: { min: 0, max: 0, target: 0 },
  }

  valueLevels: { [key: string]: string } = {
    min: "Minimum",
    max: "Maximum",
    target: "Target",
  }
  valueLabels: { [key: string]: string } = {
    Ph: "PH",
    Ec: "EC",
  }

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.onSensorRangeData().pipe(takeUntil(this.destroy$)).subscribe((data: SensorRangeData) => {
      if (!this.firstDataArrived) {
        this.values['Ph'] = { min: data.minPh, max: data.maxPh, target: data.targetPh };
        this.values['Ec'] = { min: data.minEc, max: data.maxEc, target: data.targetEc };
        this.firstDataArrived = true;
        this.controlSensorRangeData = data;
        this.isLoading = false;
      }
      else {
        if (isEqual(data, this.controlSensorRangeData)) {
          this.isLoading = false;
        }
      }

    });
  }

  onBlur(key: string, field: string, data: FocusEvent) {
    const fieldAsserted = field as 'min' | 'max' | 'target'
    const delta = Number((data.target as HTMLInputElement).value);
    this.changeValue(key, fieldAsserted, delta);
  }

  round(value: number, precision = 2): number {
    return parseFloat(value.toFixed(precision));
  }

  clampTarget(key: string, field: 'min' | 'max' | 'target', delta: number): boolean {
    const item = this.values[key];
    switch (field) {
      case 'min':
        if (item.target < delta) return false;
        break;
      case 'max':
        if (item.target > delta) return false;
        break;
      case 'target':
        if (item.min > delta || item.max < delta) return false
        break;
    }
    return true;
  }


  changeValue(key: string, field: string, delta: number, isRecursive: boolean = false): void {
    if (!this.isLoading) {
      const fieldAsserted = field as 'min' | 'max' | 'target'
      const updated = this.round(isRecursive ? this.values[key][fieldAsserted] + delta : delta);
      if (this.clampTarget(key, fieldAsserted, updated)) {
        this.values[key][fieldAsserted] = updated;
        this.controlSensorRangeData = {
          maxEc: this.values["Ec"].max,
          maxPh: this.values["Ph"].max,
          minEc: this.values["Ec"].min,
          minPh: this.values["Ph"].min,
          targetEc: this.values["Ec"].target,
          targetPh: this.values["Ph"].target,
          type: "sensorRangeData"
        }
        const keyFieldPair = field + key;
        this.socketService.setTargets(keyFieldPair, updated);
        this.isLoading = true;
        console.log("AAAA");
        setTimeout(() => { this.isLoading = false; }, 2000);
      }
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getValue(key: string, property: string): number | null {
    // Check if key exists in values
    if (!(key in this.values)) return null;

    // Check if property is valid
    const validProperties = ['min', 'max', 'target'];
    if (!validProperties.includes(property)) return null;

    // Type assertion now safe
    return this.values[key][property as 'min' | 'max' | 'target'];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    console.log("destroyed");
  }
}
