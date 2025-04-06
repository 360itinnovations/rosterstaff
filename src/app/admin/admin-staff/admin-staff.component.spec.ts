import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStaffComponent } from './admin-staff.component';

describe('AdminStaffComponent', () => {
  let component: AdminStaffComponent;
  let fixture: ComponentFixture<AdminStaffComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
