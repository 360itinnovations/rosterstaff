import { Injectable } from '@angular/core';
import { MenuItem } from './menu-item';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  menuItems: Array<MenuItem> = []; // Initialize as an empty array
  menuUpdate = new Subject<Array<MenuItem>>(); // Specify type for Subject
  menuSideOpened = !this.detectMob();

  constructor() {}

  /**
   * Load a new menu into the service
   * @param menuItems an array of menu items to display
   */
  loadMenu(menuItems: Array<MenuItem>) {
    this.menuItems = menuItems;
    this.menuUpdate.next(this.menuItems); // Pass the menu items
  }

  /**
   * Place a badge on a menu item
   * @param menuName name of menu
   * @param badgeNumber number of notifications
   */
  setBadge(menuName: string, badgeNumber: number) {
    for (let i = 0; i < this.menuItems.length; i++) {
      if (this.menuItems[i].name === menuName) {
        this.menuItems[i].hasBadge = true;
        this.menuItems[i].badgeNum = badgeNumber;
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the badge number of the first menu found with the given menu name
   * @param menuName name of menu
   */
  getBadge(menuName: string) {
    const menu = this.menuItems.filter((mItem) => mItem.name === menuName);
    return menu.length !== 0 ? menu[0].badgeNum : 0;
  }

  toggleMenuSidebar() {
    this.menuSideOpened = !this.menuSideOpened;
  }

  /**
   * Remove a badge from a menu item
   * @param menuName name of menu
   */
  removeBadge(menuName: string) {
    for (let i = 0; i < this.menuItems.length; i++) {
      if (this.menuItems[i].name === menuName) {
        this.menuItems[i].hasBadge = true;
        this.menuItems[i].badgeNum = null;
        return true;
      }
    }
    return false;
  }

  /**
   * Get the total number of notifications on menu items
   */
  getTotalNotifications() {
    let totalNotifications = 0;
    for (let i = 0; i < this.menuItems.length; i++) {
      if (this.menuItems[i].hasBadge) {
        totalNotifications += this.menuItems[i].badgeNum || 0; // Default to 0 if undefined
      }
    }
    return totalNotifications;
  }

  /**
   * Refresh the menu
   */
  refreshMenu() {
    this.menuUpdate.next(this.menuItems); // Pass the menu items
  }

  /**
   * Detects if the window width is small
   */
  private detectMob() {
    return window.innerWidth <= 1000;
  }
}
