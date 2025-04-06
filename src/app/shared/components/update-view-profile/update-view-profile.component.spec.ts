import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateViewProfileComponent } from './update-view-profile.component';

describe('UpdateViewProfileComponent', () => {
  let component: UpdateViewProfileComponent;
  let fixture: ComponentFixture<UpdateViewProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateViewProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateViewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
