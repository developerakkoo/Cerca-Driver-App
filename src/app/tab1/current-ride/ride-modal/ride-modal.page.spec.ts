import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RideModalPage } from './ride-modal.page';

describe('RideModalPage', () => {
  let component: RideModalPage;
  let fixture: ComponentFixture<RideModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RideModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
