import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { first, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardTitle, MatCardHeader, MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LoaderComponent } from '../loader/loader.component';
import { RelayDevice } from '../../types';
import { MillisecondsToTimePipe } from '../../utils/pipes/milliseconds-to-time.pipe';

@Component({
  selector: 'app-water-pump-control',
  imports: [LoaderComponent, CommonModule, FormsModule, MatCardTitle, MatCardHeader, MatCard, MatInputModule, MatButtonModule, MatIcon, MillisecondsToTimePipe],
  templateUrl: './water-pump-control.component.html',
  styleUrl: './water-pump-control.component.scss'
})
export class WaterPumpControlComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  waterPump: RelayDevice = {
    lastToggle: 0,
    onTime: 0,
    offTime: 0,
    state: false,
    totalRunCount: 0
  };

  constructor(
    private readonly socketService: SocketService,
  ) { }

  ngOnInit(): void {
    this.getwaterPump();
  }

  getwaterPump() {
    this.socketService.onWaterPump().pipe(first()).subscribe((data: RelayDevice) => {
      console.log("Water Pump data received:", data);
      this.waterPump = data;
      this.isLoading = false;
    });
  }

  onTimeSeconds(): number {
    return this.waterPump.onTime / 1000;
  }
  offTimeSeconds(): number {
    return this.waterPump.offTime / 1000;
  }

  showTimeInHours(timeInSeconds: number): number {
    return timeInSeconds / 1000 / 60;
  }

  changeOffTime(direction: boolean) {
    if (direction) {
      this.waterPump.offTime += 1000 * 60; // Increase by 1 minute
    } else {
      this.waterPump.offTime -= 1000 * 60; // Decrease by 1 minute
    }

  }

  changeOnTime(direction: boolean) {
    if (direction) {
      this.waterPump.onTime += 1000 // Increase by 1 second
    } else {
      this.waterPump.onTime -= 1000 // Decrease by 1 second
    }

  }

  updatewaterPumpSettings() {
    this.isLoading = true;
    this.socketService.sendWaterPumpTimes(this.waterPump).pipe(first()).subscribe({
      next: (response) => {
        console.log("Water Pump settings updated:", response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error updating Light Source settings:", error);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
