import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShiftComponent } from './view-shift.component';

describe('ViewShiftComponent', () => {
  let component: ViewShiftComponent;
  let fixture: ComponentFixture<ViewShiftComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewShiftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
