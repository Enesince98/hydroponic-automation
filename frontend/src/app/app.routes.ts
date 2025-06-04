import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PumpControlComponent } from './components/pump-control/pump-control.component';
import { TargetSettingsComponent } from './components/target-settings/target-settings.component';
import { ChartsComponent } from './components/charts/charts.component';
import { CallibrationComponent } from './components/callibration/callibration.component';
import { LightComponent } from './components/light/light.component';
import { WaterPumpControlComponent } from './components/water-pump-control/water-pump-control.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'pumps', component: PumpControlComponent },
	{ path: 'settings', component: TargetSettingsComponent },
	{ path: 'charts', component: ChartsComponent },
	{ path: 'calibration', component: CallibrationComponent },
	{ path: 'light', component: LightComponent },
	{ path: 'water', component: WaterPumpControlComponent },
	{ path: '**', redirectTo: 'dashboard' }
];
