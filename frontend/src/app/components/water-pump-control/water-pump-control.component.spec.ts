import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterPumpControlComponent } from './water-pump-control.component';

describe('WaterPumpControlComponent', () => {
  let component: WaterPumpControlComponent;
  let fixture: ComponentFixture<WaterPumpControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterPumpControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterPumpControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
