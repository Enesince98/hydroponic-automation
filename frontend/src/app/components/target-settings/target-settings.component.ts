// src/app/components/target-settings/target-settings.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import isEqual from 'lodash/isEqual';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Limits } from '../../types';

@Component({
  selector: 'app-target-settings',
  templateUrl: './target-settings.component.html',
  imports: [LoaderComponent, CommonModule, FormsModule, MatLabel, MatFormField, MatCardContent, MatCardTitle, MatCardHeader, MatCard, MatInputModule, MatButtonModule, MatIcon],
  styleUrls: ['./target-settings.component.scss']
})
export class TargetSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  firstDataArrived = false;
  values = {
    Ph: {} as Limits,
    Ec: {} as Limits,
  };

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    combineLatest([
      this.socketService.onPhLimits(),
      this.socketService.onEcLimits(),
    ]).pipe(takeUntil(this.destroy$)).subscribe(
        {
      next: ([phLimits, ecLimits]) => {
        this.values = {
          Ph: {
            min: phLimits.min,
            max: phLimits.max,
            target: phLimits.target,
            delta: phLimits.delta,
          },
          Ec: {
            min: ecLimits.min,
            max: ecLimits.max,
            target: ecLimits.target,
            delta: ecLimits.delta,
          }
        };
        this.isLoading = false;
      },
      error: (err) => console.error("Socket error:", err),
    });
  }

  onBlur(key: string, field: string, data: FocusEvent) {
    const fieldAsserted = field as 'min' | 'max' | 'target'
    const delta = Number((data.target as HTMLInputElement).value);
  }

  round(value: number, precision = 2): number {
    return parseFloat(value.toFixed(precision));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
