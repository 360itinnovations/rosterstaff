import { Component, ViewChild, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatCardContent } from '@angular/material/card';
import { MatFormField } from '@angular/material/input';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss'],
  imports:[MatCardContent,MatFormField]
})
export class TableListComponent implements OnInit, OnDestroy {
  @Input() inputStream: BehaviorSubject<any>;
  @Input() columnsToDisplay: Array<string>;
  @Input() prettifiedColumns: Object;
  @Output() itemClicked: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<any>();
  isLoading = true;
  streamRef: Subscription;

  constructor() {}

  ngOnInit() {
    // Custom filter to show correct values on the table
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      let tmpString = '';
      this.columnsToDisplay.forEach((column) => {
        tmpString += this.formatItem(data[column], column);
      });
      return tmpString.trim().toLowerCase().includes(filter);
    };

    this.dataSource.sort = this.sort;
    this.streamRef = this.inputStream.subscribe((tableData: any) => {
      if (tableData) {
        this.dataSource.data = tableData;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.streamRef.unsubscribe();
  }

  /**
   * Returns a pretty version of a column
   * @param columnName name of a column
   */
  getPrettifiedColumn(columnName: string) {
    if (!this.prettifiedColumns) { return columnName; }
    return this.prettifiedColumns[columnName];
  }

  /**
   * Emits an event with a row as the data
   * @param row a row
   */
  rowSelected(row: any) {
    this.itemClicked.emit(row);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Formats elements on the table for users to view
   * @param item an item to format
   * @param column the column determine the type of format
   */
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
