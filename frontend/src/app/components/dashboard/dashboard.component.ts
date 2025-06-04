import { Component, OnDestroy, OnInit } from '@angular/core';
import { TargetSettingsComponent } from '../target-settings/target-settings.component';
import { PumpControlComponent } from '../pump-control/pump-control.component';
import { MatToolbar } from '@angular/material/toolbar';
import { ChartsComponent } from '../charts/charts.component';
import { BottomNavbarComponent } from '../bottom-navbar/bottom-navbar.component';
import { SocketService } from '../../services/socket.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NutrientPump, SensorData } from '../../types';
@Component({
  selector: 'app-dashboard',
  imports: [LoaderComponent, CommonModule, TargetSettingsComponent, PumpControlComponent, ChartsComponent, BottomNavbarComponent, MatToolbar, DecimalPipe, MatCardModule, MatIcon, MatSlideToggleModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  sensorData = {} as SensorData;

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
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([sensorData, phUpPump, phDownPump, ecPump]) => {
        console.log("Sensor data received:", sensorData);
        this.sensorData = { ...this.sensorData, ...sensorData };
        this.pumpStatusData["phUpPump"] = phUpPump;
        this.pumpStatusData["phDownPump"] = phDownPump;
        this.pumpStatusData["ecPump"] = ecPump;
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
