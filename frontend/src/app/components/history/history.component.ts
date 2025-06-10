import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EnvironmentalData, NutrientPump, RelayDevice, SensorData } from '../../types';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [MatCardModule, MatIconModule, MatButtonModule, BaseChartDirective],
})
export class HistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  maxDataPoints = 50;

  historyData = {
    ecPump: {} as NutrientPump,
    phUpPump: {} as NutrientPump,
    phDownPump: {} as NutrientPump,
    waterPump: {} as RelayDevice,
    lightSource: {} as RelayDevice,
    sensors: {} as SensorData,
    environmentalData: {} as EnvironmentalData,
  };

  constructor(private readonly socketService: SocketService) { }

  public chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Canlı Veri',
        data: [],
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.2)',
        fill: true
      }
    ]
  };

  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Zaman'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Değer'
        }
      }
    }
  };

  ngOnInit(): void {
    combineLatest([
      this.socketService.onEcPump(),
      this.socketService.onPhUpPump(),
      this.socketService.onPhDownPump(),
      this.socketService.onWaterPump(),
      this.socketService.onLightSource(),
      this.socketService.onSensors(),
      this.socketService.onEnvironmentalData(),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([ecPump, phUpPump, phDownPump, waterPump, lightSource, sensors, environmentalData]) => {
      this.historyData.ecPump = ecPump;
      this.historyData.phUpPump = phUpPump;
      this.historyData.phDownPump = phDownPump;
      this.historyData.waterPump = waterPump;
      this.historyData.lightSource = lightSource;
      this.historyData.sensors = sensors;
      this.historyData.environmentalData = environmentalData;

      console.log('History data updated:', this.historyData);

      const now = new Date().toLocaleTimeString();

      this.chartData.labels!.push(now);
      (this.chartData.datasets[0].data as number[]).push(sensors.ph);

      if (this.chartData.labels!.length > this.maxDataPoints) {
        this.chartData.labels!.shift();
        (this.chartData.datasets[0].data as number[]).shift();
      }

      console.log('Chart data updated:', this.chartData);

    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}