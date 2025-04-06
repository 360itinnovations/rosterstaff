import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/user/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports:[MatFormFieldModule,MatCardModule,ReactiveFormsModule]
})
export class ResetPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  savingPassword = false;

  constructor(
    private fireAuth: AngularFireAuth,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.passwordForm = new FormGroup({
      'currentPassword': new FormControl('', Validators.required),
      'newPassword': new FormControl('', [Validators.required, Validators.minLength(6)]),
      'confirmPassword': new FormControl('', [Validators.required, Validators.minLength(6)])
    }, { validators: passwordMatchValidator });
  }

  updatePassword() {
    if (this.passwordForm.invalid) { return; }

    const oldPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    this.savingPassword = true;

    // Reauthenticate user with the current password
    this.userService.reauthenticateUser(oldPassword).then(() => {
      // Get the current user
      this.fireAuth.currentUser.then(user => {
        if (user) {
          // Update password for the current user
          user.updatePassword(newPassword).then(() => {
            this.savingPassword = false;
            this.snackBar.open('Successfully changed password', undefined, { duration: 4000 });
          }).catch((err) => {
            this.savingPassword = false;
            console.error(err);
          });
        } else {
          this.savingPassword = false;
          this.snackBar.open('No user is currently logged in', undefined, { duration: 4000 });
        }
      });
    }).catch((err) => {
      this.passwordForm.get('currentPassword')?.setErrors({ authenticated: true });
      this.savingPassword = false;
      if (err.code === 'auth/wrong-password') {
        this.passwordForm.get('currentPassword')?.setErrors({ authenticated: true });
      }
    });
  }
}

export const passwordMatchValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPass = control.get('confirmPassword');
  if (newPassword?.value === confirmPass?.value) {
    confirmPass.setErrors(null);
    return null;
  } else {
    confirmPass.setErrors({ 'passwordMatch': true });
    return { 'passwordMatch': false };
  }
};
