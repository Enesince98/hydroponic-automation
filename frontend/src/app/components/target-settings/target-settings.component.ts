// src/app/components/target-settings/target-settings.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import { combineLatest, concat, concatMap, delay, first, Subject, takeUntil, timer } from 'rxjs';
import { Limits } from '../../types';

@Component({
  selector: 'app-target-settings',
  templateUrl: './target-settings.component.html',
  imports: [LoaderComponent, CommonModule, FormsModule, MatLabel, MatFormField, MatCardContent, MatCardTitle, MatCardHeader, MatCard, MatInputModule, MatButtonModule, MatIcon, TitleCasePipe],
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
    this.loadLimits();
  }

  loadLimits() {
  combineLatest([
      this.socketService.onPhLimits(),
      this.socketService.onEcLimits(),
    ]).pipe(first()).subscribe(
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

  incrementLimit(type: 'Ph' | 'Ec', limit: 'min' | 'max' | 'target' | 'delta') {
    this.values[type][limit] = Math.round((this.values[type][limit] + 0.1)*10)/10;;
    console.log(`Incremented ${type} ${limit} to`, this.values[type][limit]);
  }
  decreaseLimit(type: 'Ph' | 'Ec', limit: 'min' | 'max' | 'target' | 'delta') {
    this.values[type][limit] = Math.round((this.values[type][limit] - 0.1)*10)/10;;
    console.log(`Incremented ${type} ${limit} to`, this.values[type][limit]);
  }

updateTargetLimits() {
  this.isLoading = true;
  this.socketService.sendLimits([
    this.values.Ph,this.values.Ec
  ]).pipe(first()).subscribe({
    next: (response) => {
      console.log("Target limits updated:", response);
      this.loadLimits();
    },
    error: (error) => {
      console.error("Error updating target limits:", error);
      this.isLoading = false;
    }
  });
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
