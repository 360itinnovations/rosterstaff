import { Component } from '@angular/core';
import { MenuService } from '../../_services/menu/menu.service';
import { AdminMenuItems } from '../admin-menu-items';
import { MenuComponent } from 'src/app/core/menu/menu.component';

@Component({
  selector: 'app-admin-portal',
  templateUrl: './admin-portal.component.html',
  imports:[MenuComponent]
})
export class AdminPortalComponent {

  constructor(private menuService: MenuService) {
    this.menuService.loadMenu(AdminMenuItems);
  }
}
