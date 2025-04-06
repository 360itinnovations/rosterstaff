import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateLocationComponent } from './create-update-location.component';

describe('CreateUpdateLocationComponent', () => {
  let component: CreateUpdateLocationComponent;
  let fixture: ComponentFixture<CreateUpdateLocationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateUpdateLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
