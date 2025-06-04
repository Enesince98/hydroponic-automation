import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
@Component({
  selector: 'app-bottom-navbar',
  imports: [MatIconModule, RouterModule, MatSidenavModule, MatToolbar, MatListModule],
  templateUrl: './bottom-navbar.component.html',
  styleUrl: './bottom-navbar.component.scss'
})
export class BottomNavbarComponent {

}
