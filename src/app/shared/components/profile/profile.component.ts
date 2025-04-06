import { Component, OnInit } from '@angular/core';
import { UpdateViewProfileComponent } from '../update-view-profile/update-view-profile.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
  selector: 'app-profile',
  imports:[UpdateViewProfileComponent, ResetPasswordComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
