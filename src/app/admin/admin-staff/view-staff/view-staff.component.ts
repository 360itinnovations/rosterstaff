import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { StaffService, Staff } from 'src/app/_services/staff/staff.service';
import { Observable } from 'rxjs';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { TableListComponent } from 'src/app/shared/components/table-list/table-list.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-view-staff',
  templateUrl: './view-staff.component.html',
  styleUrls: ['./view-staff.component.scss'],
  imports:[TableListComponent, MatCardModule]

})
export class ViewStaffComponent implements OnInit {
  @Output() changeTab = new EventEmitter<any>();
  staffStream: Observable<{}[]>;
  columnsToDisplay = ['firstName', 'lastName', 'email', 'phoneNum'];
  prettifiedColumns = {
    firstName: 'First Name',
    lastName: 'Last name',
    email: 'Email',
    phoneNum: 'Phone Number'
  };

  constructor(private staffService: StaffService, private bottomSheet: MatBottomSheet) {
    this.staffStream = this.staffService.staffStream;
  }

  ngOnInit() {}

  openBottomSheet(staff: Staff) {
    this.bottomSheet.open(StaffSheetComponent, {
      data: staff
    }).afterDismissed().subscribe((data) => {
      if (data && data['action']) {
        this.changeTab.emit({
          type: data.action,
          staff: staff
        });
      }
    });
  }

  addStaff() {
    this.changeTab.emit({
      type: 'add',
      staff: null
    });
  }
}

@Component({
  selector: 'app-staff-sheet',
  imports:[MatIconModule,MatNavList],
  template: `
  <mat-nav-list>
    <a mat-list-item (click)="showMoreDetails()">
      <mat-icon>poll</mat-icon>
      <span mat-line>Show Full Staff Details</span>
    </a>
    <a mat-list-item (click)="editStaff()">
      <mat-icon>edit</mat-icon>
      <span mat-line>Update Staff Member</span>
    </a>
    <a mat-list-item (click)="deleteStaff()">
      <mat-icon>delete</mat-icon>
      <span mat-line>Delete Staff Member</span>
    </a>
  </mat-nav-list>`
})
export class StaffSheetComponent {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public staff: Staff,
    private bottomSheetRef: MatBottomSheetRef<StaffSheetComponent>,
    private dialog: MatDialog,
    private staffService: StaffService,
    private snackbar: MatSnackBar
  ) {
  }

  showMoreDetails() {
    this.bottomSheetRef.dismiss({
      action: 'view'
    });
  }

  editStaff() {
    this.bottomSheetRef.dismiss({
      action: 'edit'
    });
  }

  deleteStaff() {
    const confirmDialog = this.dialog.open(ConfirmationComponent, {
      data: {
        message: 'Are you sure you want to delete the staff member ' + this.staff.firstName + ' ' +  this.staff.lastName + '?' }
    });

    confirmDialog.afterClosed().subscribe((data) => {
      if (data) {
        this.staffService.deleteStaff(this.staff.uid).then(() => {
          this.snackbar.open('Successfully deleted ' + this.staff.firstName + '\'s account', null, { duration: 5000 });
        }).catch((err) => {
          if (err.code === 'invalid-argument') {
            if (err.message === 'You cannot delete your own account') {
              this.snackbar.open('You cannot delete your own account!', null, { duration: 5000 });
            } else {
              this.snackbar.open('Staff member could not be deleted. Please contact support.', null, { duration: 5000 });
            }
          } else if (err.code === 'not-found') {
            this.snackbar.open('Staff member ' + this.staff.firstName + ' has already been deleted', null, { duration: 5000 });
          } else if (err.code === 'permission-denied') {
            this.snackbar.open('You do not have permission to delete this account', null, { duration: 5000 });
          } else {
            this.snackbar.open('Something went wrong during deletion of staff. Please contact support.' , null, { duration: 5000 });
          }
        });
      }
      this.bottomSheetRef.dismiss();
    });
  }
}
