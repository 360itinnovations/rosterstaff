import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private fireAuth: AngularFireAuth, private router: Router) { }

  canActivate() {
    return new Promise<boolean>((resolve) => {
      this.fireAuth.currentUser.then((user) => {
        if (user) {
          resolve(true);
          return;
        }
        this.router.navigate(['']);
        resolve(false);
      });
    });
  }

  canActivateChild() {
    return this.canActivate();
  }
}
