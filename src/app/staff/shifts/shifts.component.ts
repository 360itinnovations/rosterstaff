import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShiftService } from '../../_services/shift/shift.service';
import { Shift } from '../../_services/shift/shift';
import { Subscription, Subject } from 'rxjs';
import { ShiftViewComponent } from './shift-view/shift-view.component';
import {  MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  imports:[ShiftViewComponent,MatTabsModule]
})
export class ShiftsComponent implements OnInit, OnDestroy {
  private shiftStream: Subscription;
  pendingShiftStream = new Subject();
  shiftHistoryStream = new Subject();
  currentShiftStream = new Subject();

  constructor(public shiftService: ShiftService) { }

  ngOnInit() {
    // Get initial shift data
    this.shiftService.getShifts().then((shifts: Shift[]) => this.updateShifts(shifts));

    // Subscribe to shift updates
    this.shiftStream = this.shiftService.shiftStream.subscribe((shifts: Shift[]) => {
      if (shifts) {
        this.updateShifts(shifts);
      }
    });
  }

  ngOnDestroy() {
    if (this.shiftStream) {
      this.shiftStream.unsubscribe();
    }
  }

  updateShifts(data: Shift[]) {
    const filteredShifts = this.shiftService.filterShifts(data);
    this.shiftHistoryStream.next(filteredShifts['total']);
    this.pendingShiftStream.next(filteredShifts['pending']);
    this.currentShiftStream.next(filteredShifts['upcoming']);
  }
}
