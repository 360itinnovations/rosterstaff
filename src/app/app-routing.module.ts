import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './core/login/login.component';

const routes: Routes = [
  {
    path: 'staff',
    loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule) // Updated lazy loading
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) // Updated lazy loading
  },
  {
    path: '',
    component: LoginComponent
  },
  { path: '**', redirectTo: '' } // Todo: Replace with 'page not found' component
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {}
