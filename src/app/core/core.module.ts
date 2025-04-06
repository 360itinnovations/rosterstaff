import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';

import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { MenuComponent } from './menu/menu.component';
import { MessageBoardComponent } from './message-board/message-board.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  
    LoginComponent,
    ForgotPasswordComponent,
    MenuComponent,
    MessageBoardComponent,
    
  ],
  declarations: [
   
  ],

  exports: [
    MenuComponent,
    MessageBoardComponent,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    LoginComponent,
    ForgotPasswordComponent,
  ]
})
export class CoreModule { }
