import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MatBottomSheet } from '@angular/material/bottom-sheet'; // Correct import
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShiftService, ShiftLocation } from '../../_services/shift/shift.service';
import { ConfirmationComponent } from '../../shared/components/confirmation/confirmation.component';
import { CreateUpdateLocationComponent } from './create-update-location/create-update-location.component';
import { BehaviorSubject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { TableListComponent } from 'src/app/shared/components/table-list/table-list.component';

@Component({
  selector: 'app-admin-location',
  templateUrl: './admin-location.component.html',
  styleUrls: ['./admin-location.component.scss'],
  imports:[MatCardModule, TableListComponent]

})
export class AdminLocationComponent implements OnInit {
  columnsToDisplay = ['description', 'address'];
  prettifiedColumns = {
    description: 'Description',
    address: 'Address'
  };
  locationStream: BehaviorSubject<ShiftLocation[]>;

  constructor(
    private shiftService: ShiftService,
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.locationStream = this.shiftService.locationStream;
  }

  ngOnInit() {}

  openBottomSheet(location: ShiftLocation): void {
    this.bottomSheet.open(ShiftLocationSheetComponent, {
      data: location
    });
  }

  addLocation() {
    this.dialog.open(CreateUpdateLocationComponent, {
      width: '50%',
      data: { type: 'add' }
    });
  }
}

@Component({
  selector: 'app-location-sheet',
  imports:[MatIconModule,MatNavList],
  template: `
  <mat-nav-list>
    <a mat-list-item (click)="editLocation()">
      <mat-icon>edit</mat-icon>
      <span mat-line>Update Shift Location</span>
    </a>
    <a mat-list-item (click)="deleteLocation()">
      <mat-icon>delete</mat-icon>
      <span mat-line>Delete Shift Location</span>
    </a>
  </mat-nav-list>`
})
export class ShiftLocationSheetComponent {

  constructor(
    @Inject(MatBottomSheet) public location: ShiftLocation,
    private bottomSheetRef: MatBottomSheetRef<ShiftLocationSheetComponent>,
    private dialog: MatDialog,
    private shiftService: ShiftService,
    private snackBar: MatSnackBar
  ) {}

  editLocation() {
    this.dialog.open(CreateUpdateLocationComponent, {
      width: '50%',
      data: {
        type: 'edit',
        location: this.location
      }
    });
    this.bottomSheetRef.dismiss();
  }

  deleteLocation() {
    const confirmDialog = this.dialog.open(ConfirmationComponent, {
      data: { message: `Are you sure you want to delete the location (${this.location.description})?` }
    });

    confirmDialog.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.shiftService.removeShiftLocation(this.location.uid).then(() => {
          this.snackBar.open('Location deleted successfully.', undefined, { duration: 3000 });
        }).catch(() => {
          this.snackBar.open('Failed to delete location.', undefined, { duration: 5000 });
        });
      }
      this.bottomSheetRef.dismiss();
    });
  }
}
