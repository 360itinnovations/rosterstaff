import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../_guards/auth.guard';
import { RoleGuard } from '../_guards/role.guard';

import { StaffPortalComponent } from './staff-portal/staff-portal.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { ProfileComponent } from '../shared/components/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: StaffPortalComponent,
    canActivate: [ AuthGuard, RoleGuard ],
    canActivateChild: [ AuthGuard, RoleGuard ],
    data: { roles: ['STAFF'] },
    children: [
      {
        path: 'dashboard',
        component: StaffDashboardComponent,
      },
      {
        path: 'shifts',
        component: ShiftsComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
