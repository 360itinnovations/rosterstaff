import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterStaffTableComponent } from './roster-staff-table.component';

describe('RosterStaffTableComponent', () => {
  let component: RosterStaffTableComponent;
  let fixture: ComponentFixture<RosterStaffTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RosterStaffTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterStaffTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
