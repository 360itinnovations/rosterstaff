import { Component, OnDestroy } from '@angular/core';
import { MenuService } from '../../_services/menu/menu.service';
import { ShiftService } from '../../_services/shift/shift.service';
import { StaffMenuItems } from '../staff-menu-items';
import { Shift } from '../../_services/shift/shift';
import { Subscription } from 'rxjs';
import { MenuComponent } from 'src/app/core/menu/menu.component';

@Component({
  selector: 'app-staff-portal',
  templateUrl: './staff-portal.component.html',
  imports: [MenuComponent],

})
export class StaffPortalComponent implements OnDestroy  {
  private streamSub: Subscription;

  constructor(private menuService: MenuService, private shiftService: ShiftService) {
    this.menuService.loadMenu(StaffMenuItems);

    this.shiftService.getShifts().then((shifts: Shift[]) => {
      this.updateShiftBadge(shifts);
    });
    this.setupListeners();
  }

  ngOnDestroy() {
    if (this.streamSub) { this.streamSub.unsubscribe(); }
  }

  setupListeners() {
    this.streamSub = this.shiftService.shiftStream.subscribe((shifts: Shift[]) => {
      if (shifts) {
        this.updateShiftBadge(shifts);
      }
    });
  }

  /** Update the shift badge number on the menu */
  updateShiftBadge(shifts: Shift[]) {
    const uid = this.shiftService.userService.uid;
    let numPending = 0;
    shifts.forEach(aShift => {
      const status = aShift.getStatus(uid);
      if (status == null && !aShift.hasPassed()) {
        numPending++;
      }
    });
    this.menuService.setBadge('Shifts', numPending);
  }
}
