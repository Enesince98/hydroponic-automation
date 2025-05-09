import { Component, OnDestroy, OnInit } from '@angular/core';
import { TargetSettingsComponent } from '../target-settings/target-settings.component';
import { PumpControlComponent } from '../pump-control/pump-control.component';
import { MatToolbar } from '@angular/material/toolbar';
import { ChartsComponent } from '../charts/charts.component';
import { BottomNavbarComponent } from '../bottom-navbar/bottom-navbar.component';
import { SensorData, SocketService } from '../../services/socket.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
@Component({
  selector: 'app-dashboard',
  imports: [LoaderComponent, CommonModule, TargetSettingsComponent, PumpControlComponent, ChartsComponent, BottomNavbarComponent, MatToolbar, DecimalPipe, MatCardModule, MatIcon, MatSlideToggleModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  sensorData: SensorData = {
    type: "sensorData",
    ec: 0,
    ph: 0,
    temp: 0,
    lux: 0,
    hum: 0,
  }

  pumpStatusData: Record<string, string | boolean | number> = {
    phUpPump: false,
    phDownPump: false,
    ecPump: false,
    type: "pumpStatusData",
  }
  pumpNames = ['phUpPump', 'phDownPump', 'ecPump'];

  pumpLabels: Record<string, string> = {
    phUpPump: "Base Pump",
    phDownPump: "Acid Pump",
    ecPump: "Nutrient Pump"
  }
  constructor(
    private readonly socketService: SocketService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.socketService.onSensorData(),
      this.socketService.onPumpStatusData(),
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([sensorData, pumpStatusData]) => {
        this.sensorData = { ...this.sensorData, ...sensorData };
        this.pumpStatusData = { ...this.pumpStatusData, ...pumpStatusData };
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
