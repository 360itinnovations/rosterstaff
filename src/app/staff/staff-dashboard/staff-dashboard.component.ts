import { Component, OnInit } from '@angular/core';
import { MessageBoardComponent } from 'src/app/core/message-board/message-board.component';
import { ShiftDashboardCardComponent } from './shift-dashboard-card/shift-dashboard-card.component';

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.scss'],
  imports:[MessageBoardComponent, ShiftDashboardCardComponent]
})
export class StaffDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
