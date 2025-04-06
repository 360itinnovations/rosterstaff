import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { Shift } from '../../../../_services/shift/shift';
import { ShiftService } from '../../../../_services/shift/shift.service';
import { ConfirmationComponent } from '../../../../shared/components/confirmation/confirmation.component';
import { Subject } from 'rxjs';
import { MenuService } from '../../../../_services/menu/menu.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @Input() shiftStream: Subject<Shift[]>;
  @Input() allowAccept: Boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columnsToDisplay: string[] = [];
  dynamicColumns: string[] = [];
  dataSource = new MatTableDataSource<Shift>();
  selection = new SelectionModel<Shift>(true, []);
  loadingData = true;

  constructor(
    public shiftService: ShiftService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private menuService: MenuService) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadColumns();

    this.shiftStream.subscribe((data: Shift[]) => {
      this.loadingData = false;
      this.dataSource.data = data;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  loadColumns() {
    // if (this.shiftData.length > 0) {
    //   this.columnsToDisplay = Object.keys(this.shiftData[0]);
    // }
    // TODO: Remove hardcode

    this.dynamicColumns = ['location', 'date', 'start', 'end', 'breakDuration', 'note'];

    if (this.allowAccept) {
      this.columnsToDisplay = ['select'].concat( this.dynamicColumns);
    } else {
      this.columnsToDisplay = this.dynamicColumns;
    }
  }

  /** Get a prettified version of a column name if exists */
  getColumnName(name: string) {
    const colName = {
      location: 'Location',
      start: 'Start',
      end: 'End',
      breakDuration: 'Break Duration',
      note: 'Note',
      onDuty: 'On duty',
      date: 'Date'
    };
    return colName[name] ? colName[name] : name;
  }

  /** Update a staff member's shift status to accepted or declined */
  updateShift(decision: boolean) {
    const selection = this.selection.selected;

    if (selection.length > 0) {
      this.dialog.open(ConfirmationComponent, {
        width: '15em',
      }).afterClosed().subscribe((result) => {
        if (result) {
          let shiftBadge = this.menuService.getBadge('Shifts');
          selection.forEach(element => {
            shiftBadge--;
            decision ?
              this.shiftService.acceptShift(element) :
              this.shiftService.declineShift(element);
              this.removeElement(element);
              this.menuService.setBadge('Shifts', shiftBadge);
          });
          this.selection.clear();
        }
      });
    } else {
      this.snackBar.open('No shifts selected', null, { duration: 2000 });
    }
  }

  /** Preemptively remove a shift from the table  */
  removeElement(shift: Shift) {
    const tmpData = this.dataSource.data;
    const index = tmpData.indexOf(shift);
    if (index > -1) {
      tmpData.splice(index, 1);
      this.dataSource.data = tmpData;
    }
  }

  /** Formats elements on the table for users to view */
  formatItem(item: any, column: any) {
    switch (column) {
      case 'location':
        return item.description;
      case 'breakDuration':
        return item ? item : 0;
      case 'date':
        const tmpDate = new Date(item['seconds'] * 1000);
        const dateString = tmpDate.toUTCString();
        return dateString.split(' ', 4).join(' ');
      default:
        return item;
    }
  }
}
