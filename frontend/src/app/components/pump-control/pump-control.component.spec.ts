import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpControlComponent } from './pump-control.component';

describe('PumpControlComponent', () => {
  let component: PumpControlComponent;
  let fixture: ComponentFixture<PumpControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PumpControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
