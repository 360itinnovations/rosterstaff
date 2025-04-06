import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { AdminShiftsComponent } from './admin-shifts/admin-shifts.component';
import { AdminStaffComponent } from './admin-staff/admin-staff.component';
import { AdminLocationComponent } from './admin-location/admin-location.component';
import { ProfileComponent } from '../shared/components/profile/profile.component';

import { AuthGuard } from '../_guards/auth.guard';
import { RoleGuard } from '../_guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminPortalComponent,
    canActivate: [ AuthGuard, RoleGuard ],
    canActivateChild: [ AuthGuard, RoleGuard ],
    data: { roles: ['ADMIN', 'MANAGER'] },
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'shifts',
        component: AdminShiftsComponent
      },
      {
        path: 'staff',
        component: AdminStaffComponent
      },
      {
        path: 'locations',
        component: AdminLocationComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
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
export class AdminRoutingModule { }
