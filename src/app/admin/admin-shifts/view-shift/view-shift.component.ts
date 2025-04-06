import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MatBottomSheetRef, MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ShiftService } from '../../../_services/shift/shift.service';
import { ConfirmationComponent } from '../../../shared/components/confirmation/confirmation.component';
import { Shift } from '../../../_services/shift/shift';
import { Observable } from 'rxjs';
import { MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { TableListComponent } from 'src/app/shared/components/table-list/table-list.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-view-shift',
  templateUrl: './view-shift.component.html',
  styleUrls: ['./view-shift.component.scss'],
  imports:[MatCardModule, TableListComponent]

})
export class ViewShiftComponent implements OnInit {
  @Output() changeTab = new EventEmitter<any>();
  columnsToDisplay = ['location', 'date', 'start', 'end'];
  prettifiedColumns = {
    'location': 'Location',
    'date': 'Date',
    'start': 'Start Time',
    'end': 'End Time'
  };
  shiftStream: Observable<{}[]>;

  constructor(private shiftService: ShiftService, private bottomSheet: MatBottomSheet) {
    this.shiftService.getAllShifts().then((data: Observable<{}[]>) => {
      this.shiftStream = data;
    });
  }

  ngOnInit() {}

  openBottomSheet(shift: Shift) {
    this.bottomSheet.open(ShiftSheetComponent, {
      data: shift
    }).afterDismissed().subscribe((data) => {
      if (data && data['action']) {
        this.changeTab.emit({
          type: data.action,
          shift: shift
        });
      }
    });
  }

  addShift() {
    this.changeTab.emit({
      type: 'add',
      shift: null
    });
  }
}

@Component({
  selector: 'app-shift-sheet',
  imports:[MatNavList, MatIcon],
  template: `
  <mat-nav-list>
    <a mat-list-item (click)="showMoreDetails()">
      <mat-icon>poll</mat-icon>
      <span mat-line>Show Full Shift Details</span>
    </a>
    <a mat-list-item (click)="editShift()">
      <mat-icon>edit</mat-icon>
      <span mat-line>Update Shift</span>
    </a>
    <a mat-list-item (click)="deleteShift()">
      <mat-icon>delete</mat-icon>
      <span mat-line>Delete Shift</span>
    </a>
  </mat-nav-list>`
})
export class ShiftSheetComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public shift: Shift,
    private bottomSheetRef: MatBottomSheetRef<ShiftSheetComponent>,
    private dialog: MatDialog,
    private shiftService: ShiftService
  ) {}

  showMoreDetails() {
    this.bottomSheetRef.dismiss({
      action: 'view'
    });
  }

  editShift() {
    this.bottomSheetRef.dismiss({
      action: 'edit'
    });
  }

  deleteShift() {
    const confirmDialog = this.dialog.open(ConfirmationComponent, {
      data: { message: `Are you sure you want to delete the shift at (${this.shift.location.description}) on (Todo_date)?` }
    });

    confirmDialog.afterClosed().subscribe((data) => {
      if (data) {
        this.shiftService.deleteShift(this.shift);
      }
      this.bottomSheetRef.dismiss();
    });
  }
}
