import { MenuItem } from '../_services/menu/menu-item';

export let AdminMenuItems = [
  new MenuItem('Dashboard', 'dashboard', 'home', false),
  new MenuItem('Shifts', 'shifts', 'receipt', true),
  new MenuItem('Staff', 'staff', 'people', true),
  new MenuItem('Locations', 'locations', 'map', false),
  new MenuItem('Profile', 'profile', 'account_circle', false),
];
