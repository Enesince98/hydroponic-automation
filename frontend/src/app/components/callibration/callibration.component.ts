import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-callibration',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './callibration.component.html',
  styleUrl: './callibration.component.scss'
})
export class CallibrationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = false;
  calibrationMode = false;
  receivedPhCalibrationData = {
    type: "phCalibrationData",
    phValue: 0,
    phVoltage: 0,
  }

  constructor(
    private readonly socketService: SocketService,
  ) { }

  ngOnInit(): void {
    of({
    type: "phCalibrationData",
    phValue: 0,
    phVoltage: 0,
  }).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      console.log(data);
      this.receivedPhCalibrationData = data;
    });
  }

  //ekrandaki 4.01 tuşuna basınca ekran kullanıma kapatılıp 30 saniye beklenecek
  //tıklandığı anda arduinoya voltaj değerlerini gönderme sinyali gidecek ve 30 saniye boyunca ölçüm yapacak
  //ölçüm sonuçlarını yollayacak ve 6.86 tuşu aktif olacak kullanıcı ona da basınca yine bekleyecek
  //iki sonuç da okununca kalibrasyon fonksiyonu bu iki değeri kullanarak slope ve offset hesaplayacak
  //elde edilen sonucu socket yardımıyla arduinoya gönderecek 
  //ekranda basitçe kalibrasyon tamamlandı yazıp kullanıcı dashboard sayfasına yönlendirilebilir.

  startCalibration(bufferType: number) {
    console.log("clicked buffer: ", bufferType);
    // this.socketService.startPhCalibration();
    this.calibrationMode = true;
  }



  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
