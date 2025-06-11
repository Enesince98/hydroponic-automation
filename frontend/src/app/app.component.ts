import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavbarComponent } from './components/bottom-navbar/bottom-navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavbarComponent, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hydroponics-dashboard';
}
