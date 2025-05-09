// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ChartsComponent } from './components/charts/charts.component';
import { PumpControlComponent } from './components/pump-control/pump-control.component';
import { TargetSettingsComponent } from './components/target-settings/target-settings.component';
import { SocketService } from './services/socket.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
	declarations: [
		AppComponent,
		DashboardComponent,
		ChartsComponent,
		PumpControlComponent,
		TargetSettingsComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatCardModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatToolbarModule,
		FormsModule,
	],
	providers: [SocketService],
	bootstrap: [AppComponent]
})
export class AppModule { }
