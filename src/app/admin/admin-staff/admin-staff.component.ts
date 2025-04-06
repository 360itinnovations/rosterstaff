import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs'; 
import { Staff } from 'src/app/_services/staff/staff.service';
import { AddUpdateViewStaffComponent } from './add-update-view-staff/add-update-view-staff.component';
import { ViewStaffComponent } from './view-staff/view-staff.component';

const typeOfTab = {
  edit: {
    title: 'Update Staff Member',
    type: 'edit'
  },
  view: {
    title: 'View Staff Member',
    type: 'view'
  },
  add: {
    title: 'Add Staff',
    type: 'add'
  }
};
@Component({
  selector: 'app-admin-staff',
  templateUrl: './admin-staff.component.html',
  styleUrls: ['./admin-staff.component.scss'],
  imports:[MatTabsModule, AddUpdateViewStaffComponent, ViewStaffComponent]

})
export class AdminStaffComponent implements OnInit {
  newTab: any;
  selectedStaff: Staff;
  selected = new FormControl(0);
  constructor() { }

  ngOnInit() {}

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
    this.loadTab(eventData.type, eventData.staff);
  }

  /**
   * Load a new tab which will allow the user to either edit, view or modify a staff instance
   * @param tabType type of tab which must one of the following strings ['edit', 'view', 'add']
   * @param staff a staff to pass into the new tab
   */
  loadTab(tabType: string, staff: Staff) {
    if (!typeOfTab[tabType]) {
      throw Error('Parameter must be either edit, view or add');
    }
    this.newTab = typeOfTab[tabType];
    this.selectedStaff = staff;
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
