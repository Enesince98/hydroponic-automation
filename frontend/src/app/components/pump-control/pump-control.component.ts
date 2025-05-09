import { Component, OnDestroy, OnInit } from '@angular/core';
import { PumpStatusData, SocketService } from '../../services/socket.service';
import { MatFormField, MatInputModule, MatLabel, } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardHeader, MatCardModule, MatCardTitle } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import isEqual from 'lodash/isEqual';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pump-control',
  imports: [LoaderComponent, CommonModule, FormsModule, MatFormFieldModule, MatLabel, MatFormField, MatCardContent, MatCardTitle, MatCardHeader, MatCard, MatInputModule, MatButtonModule, MatIcon],
  templateUrl: './pump-control.component.html',
  styleUrls: ['./pump-control.component.scss']
})
export class PumpControlComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  firstDataArrived = false;
  controlPumpStatusData = {} as PumpStatusData;
  pumpStatusData: { [key: string]: number } = {
    pumpDuration: 0,
    intervalBetweenPumpRun: 0
  }

  pumpStatusLabels: { [key: string]: string } = {
    pumpDuration: "Runtime of Pumps",
    intervalBetweenPumpRun: "Control Goods Interval",
  }
  // pumpLabels: { [key: string]: string } = {
  //   phUpPump: "Base Pump",
  //   phDownPump: "Acid Pump",
  //   ecPump: "Nutrient Pump"
  // }

  //pompa kontrol aralığı 2-3dk
  //pompa çalışma süresi

  ngOnInit(): void {
    this.socketService.onPumpStatusData().pipe(takeUntil(this.destroy$)).subscribe((data: PumpStatusData) => {
      if (!this.firstDataArrived) {
        this.pumpStatusData["pumpDuration"] = data.pumpDuration / 1000;
        this.pumpStatusData["intervalBetweenPumpRun"] = data.intervalBetweenPumpRun / 1000;
        this.firstDataArrived = true;
        this.isLoading = false;
        this.controlPumpStatusData = data;
      }
      else {
        if (isEqual(data, this.controlPumpStatusData)) {
          this.isLoading = false;
        }
      }
    });
  }

  onBlur(key: string, data: FocusEvent) {
    const delta = Number((data.target as HTMLInputElement).value);
    this.changeValue(key, delta);
  }

  changeValue(key: string, delta: number, isRecursive: boolean = false): void {
    if (!this.isLoading) {
      const updated = isRecursive ? this.pumpStatusData[key] + delta : delta;
      console.log(key, delta, updated);
      this.pumpStatusData[key] = updated;
      if (key === "pumpDuration") this.controlPumpStatusData.pumpDuration = updated * 1000;
      if (key === "intervalBetweenPumpRun") this.controlPumpStatusData.intervalBetweenPumpRun = updated * 1000;
      this.socketService.setPumpOptions(key, updated * 1000);
      this.isLoading = true;
      setTimeout(() => { this.isLoading = false; }, 2000);
    }
  }

  constructor(private socketService: SocketService) { }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    console.log("destroyed");
  }

  // togglePump(key: string): void {
  //   // this.pumpStatusData[key] = !this.pumpStatusData[key];
  //   // Optional: send status to server here
  //   console.log(this.pumpStatusData)
  //   console.log(`${key} is now ${this.pumpStatusData[key] ? 'ON' : 'OFF'}`);

  //   // Emit the pump control command to the backend
  //   this.socketService.controlPump(this.pumpStatusData);
  // }
}
