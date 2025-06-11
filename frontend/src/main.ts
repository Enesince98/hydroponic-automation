import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DecimalPipe } from '@angular/common';
import { SocketService } from './app/services/socket.service';
import { MockSocketService } from './app/services/mock-socket.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      CommonModule,
      MatCardModule,
      MatIconModule,
      MatInputModule,
      MatButtonModule,
      MatFormFieldModule,
      MatToolbarModule,
      FormsModule,
      MatSlideToggleModule
    ),
    { provide: SocketService, useClass: MockSocketService },
    DecimalPipe,
    MockSocketService
  ]
}).catch(err => console.error(err));
