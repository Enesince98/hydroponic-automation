import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService, WaterPumpData } from '../../services/socket.service';
import { Subject, takeUntil } from 'rxjs';
import { isEqual, omit } from 'lodash';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardContent, MatCardTitle, MatCardHeader, MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatLabel, MatFormField, MatInputModule } from '@angular/material/input';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-water-pump-control',
  imports: [LoaderComponent, CommonModule, FormsModule, MatLabel, MatFormField, MatCardContent, MatCardTitle, MatCardHeader, MatCard, MatInputModule, MatButtonModule, MatIcon],
  templateUrl: './water-pump-control.component.html',
  styleUrl: './water-pump-control.component.scss'
})
export class WaterPumpControlComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  firstDataArrived = false;
  controlWaterPumpData = {} as WaterPumpData;
  values: WaterPumpData = {
    type: 'setWaterPumpTimings',
    onTime: 0,
    offTime: 0,
  }

  constructor(
    private readonly socketService: SocketService,
  ) { }

  ngOnInit(): void {
    this.socketService.onWaterPumpData().pipe(takeUntil(this.destroy$)).subscribe((data: WaterPumpData) => {
      if (!this.firstDataArrived) {
        this.values.offTime = data.offTime;
        this.values.onTime = data.onTime;
        this.firstDataArrived = true;
        this.controlWaterPumpData = data;
        this.isLoading = false;
      }
      else {
        console.log(omit(data, "type"), omit(this.values, "type"));
        if (isEqual(omit(data, "type"), omit(this.values, "type"))) {
          this.isLoading = false;
        }
      }

    });
  }

  changeValue(isOnTime: boolean, value: number) {
    if (isOnTime) this.values.onTime = this.values.onTime += value;
    else this.values.offTime = this.values.offTime += value;

    this.socketService.setWaterPumpTimings(this.values);
    this.isLoading = true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
