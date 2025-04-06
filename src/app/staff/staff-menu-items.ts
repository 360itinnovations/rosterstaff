import { MenuItem } from '../_services/menu/menu-item';

export let StaffMenuItems = [
  new MenuItem('Dashboard', 'dashboard', 'home', false),
  new MenuItem('Shifts', 'shifts', 'receipt', true),
  new MenuItem('Profile', 'profile', 'account_circle', false)
];
