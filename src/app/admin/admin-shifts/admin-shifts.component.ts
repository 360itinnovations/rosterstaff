import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { FormControl } from '@angular/forms';
import { Shift } from '../../_services/shift/shift';
import { ViewShiftComponent } from './view-shift/view-shift.component';
import { AddUpdateViewShiftComponent } from './add-update-view-shift/add-update-view-shift.component';

const typeOfTab = {
  edit: {
    title: 'Update Shift',
    type: 'edit'
  },
  view: {
    title: 'View Details',
    type: 'view'
  },
  add: {
    title: 'Add Shift',
    type: 'add'
  }
};

@Component({
  selector: 'app-admin-shifts',
  templateUrl: './admin-shifts.component.html',
  styleUrls: ['./admin-shifts.component.scss'],
  imports:[MatTabsModule, ViewShiftComponent, AddUpdateViewShiftComponent]

})
export class AdminShiftsComponent implements OnInit {
  newTab: any;
  selectedShift: Shift;
  selected = new FormControl(0);
  constructor() { }

  ngOnInit() {
  }

  /**
   * Allows the user to dynamically change the tabs
   */
  changeTab(eventData: any) {
    if (!eventData || !typeOfTab[eventData['type']]) {
      throw Error('Invalid parameter');
    }
    if (eventData.type === 'add') {
      this.selected.setValue(1);
      return;
    }
    this.loadTab(eventData.type, eventData.shift);
  }

  /**
   * Load a new tab which will allow the user to either edit, view or modify a shift instance
   * @param tabType type of tab which must one of the following strings ['edit', 'view', 'add']
   * @param shift a shift to pass into the new tab
   */
  loadTab(tabType: string, shift: Shift) {
    if (!typeOfTab[tabType]) {
      throw Error('Parameter must be either edit, view or add');
    }
    this.newTab = typeOfTab[tabType];
    this.selectedShift = shift;
    this.selected.setValue(2);
  }

  /**
   * Automatically closes the new tab when user navigates away
   * @param event tab change event
   */
  tabChanged(event: MatTabChangeEvent) {
    this.selected.setValue(event.index);
    if (this.selected.value !== 2) {
      this.newTab = null;
    }
  }
}
