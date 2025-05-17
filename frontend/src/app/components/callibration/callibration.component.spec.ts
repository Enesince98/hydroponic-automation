import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallibrationComponent } from './callibration.component';

describe('CallibrationComponent', () => {
  let component: CallibrationComponent;
  let fixture: ComponentFixture<CallibrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallibrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallibrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
