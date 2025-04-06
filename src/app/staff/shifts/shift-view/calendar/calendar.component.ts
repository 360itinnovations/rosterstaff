import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  @Input() shiftData;

  constructor() { }

  ngOnInit() {
    // Data passed from parent into here to be displayed
    console.log(this.shiftData);
  }

}
