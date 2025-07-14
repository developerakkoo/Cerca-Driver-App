import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentRidePage } from './current-ride.page';

describe('CurrentRidePage', () => {
  let component: CurrentRidePage;
  let fixture: ComponentFixture<CurrentRidePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentRidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
