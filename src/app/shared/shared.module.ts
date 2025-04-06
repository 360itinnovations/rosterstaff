import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { TableListComponent } from './components/table-list/table-list.component';
import { UpdateViewProfileComponent } from './components/update-view-profile/update-view-profile.component';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmationComponent,
    ResetPasswordComponent,
    TableListComponent,
    UpdateViewProfileComponent,
    ProfileComponent,
  ],
  declarations: [
  ],
  exports: [
    ResetPasswordComponent,
    TableListComponent,
    UpdateViewProfileComponent,
  ],
})
export class SharedModule { }
