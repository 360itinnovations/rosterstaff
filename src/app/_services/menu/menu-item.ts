export class MenuItem {
  name: string;
  routerLink: string;
  icon: string;
  hasBadge: boolean;
  badgeNum = 0;

  constructor(
    name: string,
    routerLink: string,
    icon: string,
    hasBadge: boolean
  ) {
    this.name = name;
    this.routerLink = routerLink;
    this.icon = icon;
    this.hasBadge = hasBadge;
  }
}
