import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateViewStaffComponent } from './add-update-view-staff.component';

describe('AddUpdateViewStaffComponent', () => {
  let component: AddUpdateViewStaffComponent;
  let fixture: ComponentFixture<AddUpdateViewStaffComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateViewStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateViewStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
