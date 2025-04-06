import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../_services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(private userService: UserService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkRole(next.data.roles ? next.data.roles : next.parent.data);
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkRole(next.data.roles ? next.data.roles : next.parent.data.roles);
  }

  checkRole(requiredRoles: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (requiredRoles === null) {
        reject(false);
      }
      this.userService.getRoles().then((userRoles) => {
        resolve(requiredRoles.some(r => userRoles.indexOf(r) >= 0));
      });
    });
  }
}
