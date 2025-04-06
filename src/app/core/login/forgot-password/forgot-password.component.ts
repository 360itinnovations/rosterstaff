import { Component, Inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-forgot-password',
  template: `
    <mat-spinner
      mode="indeterminate"
      diameter="20"
      color="accent"
      *ngIf="showLoading"
      style="float: right;">
    </mat-spinner>

    <h2 mat-dialog-title>Reset Password</h2>

    <div *ngIf="!emailSent">
      <mat-dialog-content>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="email" spellcheck="false" (keyup.enter)="sendReset()" placeholder="Email">
        </mat-form-field>
        <p style="color: red; font-size: 0.8em; margin: 0; height: 1.5em">{{ message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button color="accent" (click)="sendReset()" [disabled]="showLoading">Send</button>
      </mat-dialog-actions>
    </div>

    <div *ngIf="emailSent">
      <mat-dialog-content>
        <p>Email sent successfully</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Okay</button>
      </mat-dialog-actions>
    </div>
  `
})
export class ForgotPasswordComponent {
  showLoading = false;
  emailSent = false;
  email = '';
  message = '';

  constructor(
    private fireAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.email) {
      this.email = data.email;
    }
  }

  sendReset() {
    this.emailSent = false;
    this.showLoading = true;
    this.message = '';

    this.fireAuth.sendPasswordResetEmail(this.email).then(() => {
      this.showLoading = false;
      this.emailSent = true;
    }).catch((err) => {
      this.showLoading = false;
      if (err.code === 'auth/invalid-email' || err.code === 'auth/argument-error') {
        this.message = 'Email is invalid. Please check email and try again.';
      } else if (err.code === 'auth/user-not-found') {
        this.message = 'Email was not found in the system';
      } else {
        this.message = 'Something went wrong. Please try again later.';
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
