import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';

import { StaffRoutingModule } from './staff-routing.module';
import { SharedModule } from '../shared/shared.module';

import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { ShiftViewComponent } from './shifts/shift-view/shift-view.component';
import { CalendarComponent } from './shifts/shift-view/calendar/calendar.component';
import { ListComponent } from './shifts/shift-view/list/list.component';
import { StaffPortalComponent } from './staff-portal/staff-portal.component';
import { ShiftDashboardCardComponent } from './staff-dashboard/shift-dashboard-card/shift-dashboard-card.component';

@NgModule({
  imports: [
    CommonModule,
    StaffRoutingModule,

    StaffDashboardComponent,
    ShiftsComponent,
    StaffPortalComponent,
    ShiftViewComponent,
    CalendarComponent,
    ShiftDashboardCardComponent
  ],
  declarations: [
  ]
})
export class StaffModule { }
