import { Component, OnInit } from '@angular/core';
import { UserService } from '../../_services/user/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  constructor(public userService: UserService, public fireAuth: AngularFireAuth) { }

  ngOnInit() {
  }

}
