import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Profile, UserService  } from 'src/app/_services/user/user.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import {  MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-update-view-profile',
  templateUrl: './update-view-profile.component.html',
  styleUrls: ['./update-view-profile.component.scss'],
  imports:[ReactiveFormsModule,MatCardModule , MatFormField, MatLabel, MatDatepickerModule,NgClass]
})
export class UpdateViewProfileComponent implements OnInit {
  @ViewChild('file') file;
  maxDate = new Date();
  isLoading = false;
  dpIsLoading = false;
  profileDpUrl: string;
  profileForm = new FormGroup({
    'firstName': new FormControl('', [Validators.required, Validators.maxLength(50)]),
    'lastName': new FormControl('', [Validators.required, Validators.maxLength(50)]),
    'dob': new FormControl(''), // Todo: Add date validator
    'email': new FormControl('', [Validators.required, regexValidator(/.+\@.+\..+/)]),
    'phoneNum': new FormControl('', [Validators.minLength(6), Validators.maxLength(15), regexValidator(/^[0-9]*$/)]),
    'address': new FormControl('', Validators.maxLength(300))
  });

  constructor(private userService: UserService, private snackBar: MatSnackBar, private menuService: MenuService) { }

  ngOnInit() {
    if (!this.userService.profile.isReady) {
      throw new Error('Unable to load profile');
    }
    this.profileForm.patchValue(this.userService.profile);
    this.refreshPicture();
  }

  /**
   * Update profile details of signed in user
   */
  updateDetails() {
    if (this.profileForm.invalid) { return; }
    this.isLoading = true;
    this.userService.updateProfile(this.profileForm.value as Profile).then(() => {
      this.snackBar.open('Successfully updated profile', null, { duration: 4000 });
      this.isLoading = false;
    }).catch(() => {
      this.snackBar.open('Something went wrong during update, please try again later', null, { duration: 5000 });
      this.isLoading = false;
    });
  }

  /**
   * Refresh profile picture in profile component and menu component
   */
  refreshPicture() {
    this.profileDpUrl = this.userService.getProfilePicture();
    this.menuService.refreshMenu();
  }

  /**
   * Open upload dialog
   */
  openUpload() {
    this.file.nativeElement.click();
  }

  /**
   * Delete current display picture if exists
   */
  deletePicture() {
    this.dpIsLoading = true;
    this.userService.deleteProfilePicture().then(() => {
      this.dpIsLoading = false;
      this.snackBar.open('Successfully removed display photo', null, { duration: 4000 });
      this.refreshPicture();
    }).catch(() => {
      this.dpIsLoading = false;
      this.snackBar.open('Something went wrong, please try again later', null, { duration: 4000 });
    });
  }

  /**
   * Upload a new picture for the user
   */
  uploadPicture() {
    const newPicture = this.file.nativeElement.files[0];
    if (newPicture && !this.dpIsLoading) {
      this.dpIsLoading = true;
      this.userService.updateProfilePicture(newPicture).then(() => {
        this.snackBar.open('Successfully updated profile picture!', null, { duration: 4000 });
        this.refreshPicture();
        this.dpIsLoading = false;
      }).catch((err) => {
        this.dpIsLoading = false;
        if (err === 'storage/max_file_size') {
          this.snackBar.open('File exceeds 3MB limit, and therefore could not be uploaded', null, { duration: 5000 });
          return;
        } else if (err === 'storage/unauthorized') {
          this.snackBar.open('You do not have permission to upload a new display photo for this user.', null, { duration: 4000 });
          return;
        }
        this.snackBar.open('A problem occured during photo upload, please try again later.', null, { duration: 4000 });
      });
    }
  }
}

export function regexValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const forbidden = !nameRe.test(control.value);
    return forbidden ? {'invalidFormat': {value: control.value}} : null;
  };
}
