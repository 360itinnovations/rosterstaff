import { Component, OnInit, ViewChild, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ConfirmationComponent } from '../../../shared/components/confirmation/confirmation.component';
import { CreateUpdateLocationComponent } from '../../admin-location/create-update-location/create-update-location.component';
import { ShiftService } from '../../../_services/shift/shift.service';
import { Shift } from '../../../_services/shift/shift';
import { RosterStaffTableComponent } from '../roster-staff-table/roster-staff-table.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormField } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';

/**
 * Todo:
 *  - Handle overnight shifts where start time > end time
 *  - Implement a maximum staff limit per shift
 *  - Convert date format to locale-based format (e.g., dd/mm/yyyy)
 */

const typeOfActions = {
  edit: { title: 'Edit Shift Information', action: 'Update Shift', type: 'edit' },
  add: { title: 'Shift Information', action: 'Create Shift', type: 'create' },
  view: { title: 'Shift Information', action: null, type: 'view' }
};

@Component({
  selector: 'app-add-update-view-shift',
  templateUrl: './add-update-view-shift.component.html',
  styleUrls: ['./add-update-view-shift.component.scss'],
  imports:[MatCardModule, ReactiveFormsModule, MatFormField, MatOption, MatIcon, MatDatepickerModule,MatSelectModule]

})
export class AddUpdateViewShiftComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(RosterStaffTableComponent) rosterComponent: RosterStaffTableComponent;
  @Input() type: string;
  @Input() inputShift: Shift;

  locations = [];
  selectedLocation: any;
  shiftLocObs: Subscription | null = null;
  staffUIDArray: string[] = [];
  editTable = true;
  minDate = new Date();
  selectedOperation: any;
  isLoading = { staff: true, location: true, shift: false };

  shiftForm = new FormGroup({
    location: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    start: new FormControl('', [Validators.required, Validators.min(0), Validators.max(2400)]),
    end: new FormControl('', [Validators.required, Validators.min(0), Validators.max(2400)]),
    breakDuration: new FormControl('', [Validators.min(0), Validators.max(2400)]),
    note: new FormControl('', Validators.maxLength(300))
  });

  constructor(
    private shiftService: ShiftService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (!typeOfActions[this.type]) {
      throw new Error('Invalid type parameter');
    }

    this.selectedOperation = typeOfActions[this.type];
    this.loadInputData();
    this.loadLocations();
    this.isLoading.staff = false;
  }

  ngOnDestroy() {
    this.shiftLocObs?.unsubscribe();
  }

  ngAfterViewInit() {}

  loadLocations() {
    let initialized = false;
    this.shiftLocObs = this.shiftService.locationStream.subscribe((locations) => {
      if (!locations) return;
      
      this.isLoading.location = false;
      this.locations = locations;

      if (this.inputShift && !initialized) {
        const index = this.locations.findIndex(loc => loc.description === this.inputShift.location.description);
        if (index < 0) {
          this.locations.push(this.inputShift.location);
          this.selectedLocation = this.locations[this.locations.length - 1];
        } else {
          this.selectedLocation = this.locations[index];
        }
      }
      initialized = true;
    });
  }

  private loadInputData() {
    if (!['view', 'edit'].includes(this.type)) return;
    if (!this.inputShift) throw new Error('Shift data is required for view/edit');
  
    this.shiftForm.patchValue({
      location: this.inputShift.location?.description || '',
      date: this.convertTimestampToString(this.inputShift.date),
      start: this.inputShift.start.toString(),
      end: this.inputShift.end.toString(),
      breakDuration: this.inputShift.breakDuration.toString(),
      note: this.inputShift.note
    });
  
    if (this.type !== 'add') {
      this.staffUIDArray = Object.keys(this.inputShift.onDuty);
    }
  
    if (this.type === 'view') {
      this.editTable = false;
    }
  }
  
  /**
   * Convert Firebase Timestamp or Date to a string in 'YYYY-MM-DD' format
   */
  private convertTimestampToString(timestamp: any): string {
    let date: Date;
    
    if (timestamp?.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000); // Convert Firebase Timestamp to Date
    } else {
      date = new Date(timestamp); // Assume it's already a Date
    }
  
    return date.toISOString().split('T')[0]; // Convert Date to YYYY-MM-DD string
  }
  

  submitShift() {
    if (this.shiftForm.invalid) return;

    const selectedStaff = this.rosterComponent.getSelectedStaff();
    if (Object.keys(selectedStaff).length === 0) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '30%',
        data: { message: 'You currently have no staff rostered for this shift' }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.createShift();
      });
    } else {
      this.type === 'add' ? this.createShift() : this.updateShift();
    }
  }

  updateShift() {
    if (this.shiftForm.invalid) return;
    this.isLoading.shift = true;

    const updatedShift = Object.assign(new Shift(), this.shiftForm.value);
    updatedShift.onDuty = this.rosterComponent.getSelectedStaff();
    updatedShift.shiftId = this.inputShift.shiftId;

    this.shiftService.updateShift(updatedShift).then(() => {
      this.isLoading.shift = false;
      this.snackBar.open('Shift updated!', '', { duration: 3000 });
    }).catch(() => {
      this.isLoading.shift = false;
      this.snackBar.open('Something went wrong! Try again later.', '', { duration: 5000 });
    });
  }

  createShift() {
    if (this.shiftForm.invalid) return;
    this.isLoading.shift = true;

    const newShift = Object.assign(new Shift(), this.shiftForm.value);
    newShift.onDuty = this.rosterComponent.getSelectedStaff();

    this.shiftService.createShift(newShift).then(() => {
      this.isLoading.shift = false;
      this.snackBar.open('New shift added!', '', { duration: 3000 });
    }).catch(() => {
      this.isLoading.shift = false;
      this.snackBar.open('Something went wrong! Try again later.', '', { duration: 5000 });
    });
  }

  addNewLocation() {
    const dialogRef = this.dialog.open(CreateUpdateLocationComponent, {
      width: '50%',
      data: { type: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedLocation = this.locations.find(loc => loc.description === result.description);
      }
    });
  }
}
