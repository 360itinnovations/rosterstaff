import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../_services/menu/menu.service';
import { UserService } from '../../_services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // Updated import
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatDivider } from '@angular/material/divider';
import { MatNavList } from '@angular/material/list';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [MatSidenavContent, MatSidenavContainer, MatToolbar, MatIcon, MatBadge, MatSidenav,MatDivider,MatNavList,MatSidenavContent, RouterModule,CommonModule],

})
export class MenuComponent implements OnInit, OnDestroy {
  menuItems: any;
  opened: boolean;
  companyName = 'Company';
  imageError = false;
  imageUrl: string;
  private menuUpdateSubscription: Subscription; // Subscription for menu updates

  constructor(
    private router: Router,
    private fireAuth: AngularFireAuth,
    public userService: UserService,
    public menuService: MenuService,
    private snackBar: MatSnackBar
  ) {
    // Listener for menu service changes
    if (this.menuService.menuItems != null) {
      this.updateMenu();
    }
    this.menuUpdateSubscription = this.menuService.menuUpdate.subscribe(() => this.updateMenu());
  }

  ngOnInit() {
    this.opened = this.menuService.menuSideOpened;
    this.refreshProfilePicture();
  }

  ngOnDestroy() {
    this.menuService.menuSideOpened = this.opened;
    this.menuUpdateSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
  }

  updateMenu() {
    this.menuItems = this.menuService.menuItems;
    this.refreshProfilePicture();
  }

  logout() {
    this.fireAuth.signOut().then(() => {
      this.router.navigate(['']);
    }).catch(() => {
      this.snackBar.open('An error occurred during signout, please check your network connection and try again', undefined, { duration: 10000 });
    });
  }

  refreshProfilePicture() {
    this.imageUrl = this.userService.getProfilePicture();
  }

  getName() {
    return this.userService.getFullName();
  }
}
