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
import { combineLatest, first, Subject, takeUntil } from 'rxjs';
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
  pumpStatusData = {
    phUpPump: {} as NutrientPump,
    phDownPump: {} as NutrientPump,
    ecPump: {} as NutrientPump,
  };

  pumpStatusLabels: Record<string, string> = {
    pumpDuration: "Runtime of Pumps",
    intervalBetweenPumpRun: "Control Goods Interval",
  }

  ngOnInit(): void {
    combineLatest(
      [this.socketService.onPhUpPump(),
      this.socketService.onPhDownPump(),
      this.socketService.onEcPump(),
      ]
    ).pipe(first()).subscribe({
      next: ([phUpPump, phDownPump, ecPump]) => {
        console.log("Pump data received:", phUpPump, phDownPump, ecPump);
        this.pumpStatusData.phUpPump = phUpPump;
        this.pumpStatusData.phDownPump = phDownPump;
        this.pumpStatusData.ecPump = ecPump;
        this.isLoading = false;
      }
    });
  }

  incrementPumpDuration(type: string) {
    this.pumpStatusData[type as keyof typeof this.pumpStatusData].duration += 1000;
    console.log(`Incremented ${type} pump duration to`, this.pumpStatusData[type as keyof typeof this.pumpStatusData].duration);
  }

  decreasePumpDuration(type: string) {
    this.pumpStatusData[type as keyof typeof this.pumpStatusData].duration -= 1000;
    console.log(`Incremented ${type} pump duration to`, this.pumpStatusData[type as keyof typeof this.pumpStatusData].duration);
  }

  onSeconds(miliseconds: number | boolean): string {
    if (typeof miliseconds === 'number') {
      if (miliseconds / 1000 > 60){
        return (miliseconds / 60000).toFixed(1); // Convert to minutes if greater than 60 seconds
      }
      return (miliseconds / 1000).toFixed(1); // Convert to seconds
    }
    return miliseconds.toString(); // Handle boolean case
  }
  
  updateNutrientPumpDurations() {
    this.isLoading = true;
    this.socketService.sendNutrientPumpsDurations({
      duration: [
        this.pumpStatusData.phUpPump.duration,
        this.pumpStatusData.phDownPump.duration,
        this.pumpStatusData.ecPump.duration
      ]
    }).pipe(first()).subscribe({
      next: (response) => {
        console.log("Nutrient Pumps settings updated:", response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error updating Nutrient Pumps settings:", error);
        this.isLoading = false;
      }
    });
  }

  constructor(private socketService: SocketService) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
