import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EnvironmentalData, NutrientPump, SensorData } from '../../types';
import { MockSocketService } from '../../services/mock-socket.service';
@Component({
  selector: 'app-dashboard',
  imports: [LoaderComponent, CommonModule, MatIconModule, DecimalPipe, MatCardModule, MatSlideToggleModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  sensorData = {} as SensorData;
  environmentalData = {} as EnvironmentalData;

  pumpStatusData: {[key: string]: NutrientPump}= {
    "phUpPump": {} as NutrientPump,
    "phDownPump": {} as NutrientPump,
    "ecPump": {} as NutrientPump,
  };
  pumpNames = ['phUpPump', 'phDownPump', 'ecPump'];

  pumpLabels = [
    "Base Pump",
    "Acid Pump",
    "Nutrient Pump"]
  
  constructor(
    private readonly socketService: SocketService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.socketService.onSensors(),
      this.socketService.onPhUpPump(),
      this.socketService.onPhDownPump(),
      this.socketService.onEcPump(),
      this.socketService.onEnvironmentalData(),
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([sensorData, phUpPump, phDownPump, ecPump, environmentalData]) => {
        this.sensorData = { ...this.sensorData, ...sensorData };
        this.pumpStatusData["phUpPump"] = phUpPump;
        this.pumpStatusData["phDownPump"] = phDownPump;
        this.pumpStatusData["ecPump"] = ecPump;
        this.environmentalData = environmentalData;
        this.isLoading = false;
      },
      error: (err) => console.error("Socket error:", err),
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    console.log("destroyed");
  }
}
