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
  selector: 'app-light',
  imports: [LoaderComponent, CommonModule, FormsModule, MatCardTitle, MatCardHeader, MatCard, MatInputModule, MatButtonModule, MatIcon, MillisecondsToTimePipe],
  templateUrl: './light.component.html',
  styleUrl: './light.component.scss'
})
export class LightComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  lightSource: RelayDevice = {
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
    this.getLightSource();
  }

  getLightSource() {
    this.socketService.onLightSource().pipe(first()).subscribe((data: RelayDevice) => {
      console.log("Light Source data received:", data);
      this.lightSource = data;
      this.isLoading = false;
    });
  }

  onTimeMinutes(): number {
    return this.lightSource.onTime / 1000 / 60;
  }
  offTimeMinutes(): number {
    return this.lightSource.offTime / 1000 / 60;
  }

  showTimeInHours(timeInSeconds: number): number {
    return timeInSeconds / 1000 / 60 / 60;
  }

  changeOffTime(direction: boolean) {
    if (direction) {
      this.lightSource.offTime += 1000 * 600; // Increase by 10 minute
    } else {
      this.lightSource.offTime -= 1000 * 600; // Decrease by 10 minute
    }

  }

  changeOnTime(direction: boolean) {
    if (direction) {
      this.lightSource.onTime += 1000 * 600; // Increase by 10 minute
    } else {
      this.lightSource.onTime -= 1000 * 600; // Decrease by 10 minute
    }

  }

  updateLightSourceSettings() {
    this.isLoading = true;
    this.socketService.sendLightSourceTimes(this.lightSource).pipe(first()).subscribe({
      next: (response) => {
        console.log("Light Source settings updated:", response);
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
