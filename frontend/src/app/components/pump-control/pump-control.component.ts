import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { MatFormField, MatInputModule, MatLabel, } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import isEqual from 'lodash/isEqual';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { NutrientPump } from '../../types';

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
  controlPumpStatusData = {
    phUpPump: {} as NutrientPump,
    phDownPump: {} as NutrientPump,
    ecPump: {} as NutrientPump,
  };
  pumpStatusData: NutrientPump = {
    lastRun: 0,
    duration: 0,
    isRunning: false,
    isNegative: false,
    totalRunCount: 0,
  };

  pumpStatusLabels: Record<string, string> = {
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
    combineLatest(
      [this.socketService.onPhUpPump(),
      this.socketService.onPhDownPump(),
      this.socketService.onEcPump(),
      ]
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([phUpPump, phDownPump, ecPump]) => {
        console.log("Pump data received:", phUpPump, phDownPump, ecPump);
        // this.pumpStatusData["pumpDuration"] = ecPump.pumpDuration / 1000;
        // this.pumpStatusData["intervalBetweenPumpRun"] = ecPump.intervalBetweenPumpRun / 1000;
        this.isLoading = false;
      }


      // (data: PumpStatusData) => {
      // if (!this.firstDataArrived) {
      //   this.pumpStatusData["pumpDuration"] = data.pumpDuration / 1000;
      //   this.pumpStatusData["intervalBetweenPumpRun"] = data.intervalBetweenPumpRun / 1000;
      //   this.firstDataArrived = true;
      //   this.isLoading = false;
      //   this.controlPumpStatusData = data;
      // }
      // else {
      //   if (isEqual(data, this.controlPumpStatusData)) {
      //     this.isLoading = false;
      //   }
      // }
    });
  }

  constructor(private socketService: SocketService) { }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
