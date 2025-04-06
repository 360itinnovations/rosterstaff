import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../../_services/user/user.service';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/input';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, MatFormField, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showLoading = false;

  constructor(
    private fireAuth: AngularFireAuth,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const unsubscribe = this.fireAuth.onAuthStateChanged(async (user) => {
      user ? this.routeUser() : (await unsubscribe)();
    });
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      keepSignedIn: new FormControl()
    });
  }

  routeUser() {
    this.showLoading = true;
    this.fireAuth.currentUser.then(user => {
      if (!user) {
        this.showLoading = false;
        return;
      }
      this.userService.getRoles().then((role: string) => {
        this.showLoading = false;
        if (role === 'ADMIN' || role === 'MANAGER') {
          this.router.navigate(['admin']);
        } else {
          this.router.navigate(['staff']);
        }
      }).catch(() => {
        this.showLoading = false;
        this.throwErrorMessage();
      });
    });
  }

  login() {
    if (this.loginForm.invalid) return;

    const form = this.loginForm;
    this.showLoading = true;

    const session = form.get('keepSignedIn')?.value ? 'local' : 'session';
    this.fireAuth.setPersistence(session).then(() => {
      return this.fireAuth.signInWithEmailAndPassword(
        form.get('email')?.value,
        form.get('password')?.value
      );
    }).then(() => {
      this.routeUser();
    }).catch((err) => {
      this.showLoading = false;
      switch (err.code) {
        case 'auth/wrong-password':
          form.get('password')?.setErrors({ incorrect: true });
          break;
        case 'auth/invalid-email':
          form.get('email')?.setErrors({ invalid: true });
          break;
        case 'auth/user-not-found':
          form.get('email')?.setErrors({ notFound: true });
          break;
        default:
          this.throwErrorMessage();
      }
    });
  }

  throwErrorMessage() {
    this.snackBar.open('Something went wrong. Please try again later, or email support', undefined, { duration: 5000 });
  }

  openResetPass() {
    this.dialog.open(ForgotPasswordComponent, {
      width: '22em',
      data: { email: this.loginForm.get('email')?.value }
    });
  }
}
