import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPortalComponent } from './staff-portal.component';

describe('StaffPortalComponent', () => {
  let component: StaffPortalComponent;
  let fixture: ComponentFixture<StaffPortalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffPortalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
