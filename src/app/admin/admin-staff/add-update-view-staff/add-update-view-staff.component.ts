import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { StaffService, Staff } from 'src/app/_services/staff/staff.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // Updated import
import { UserService  } from 'src/app/_services/user/user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';

const typeOfActions = {
  edit: {
    title: 'Update Staff Information',
    action: 'Update Staff',
    type: 'edit'
  },
  add: {
    title: 'Staff Information',
    action: 'Add New Staff',
    type: 'add'
  },
  view: {
    title: 'Staff Information',
    action: null,
    type: 'view'
  }
};

@Component({
  selector: 'app-add-update-view-staff',
  templateUrl: './add-update-view-staff.component.html',
  styleUrls: ['./add-update-view-staff.component.scss'],
  imports:[MatFormFieldModule, MatDatepickerModule, ReactiveFormsModule,MatCardModule]

})
export class AddUpdateViewStaffComponent implements OnInit {
  @Input() type: string;
  @Input() inputStaff: Staff;
  selectedOperation: any;
  maxDate = new Date();
  isLoading = false;
  possibleRoles = ['STAFF'];
  staffForm = new FormGroup({
    'firstName': new FormControl('', [Validators.required, Validators.maxLength(50)]),
    'lastName': new FormControl('', [Validators.required, Validators.maxLength(50)]),
    'role': new FormControl('STAFF', [Validators.required]),
    'dob': new FormControl(''), // Todo: Add date validator
    'email': new FormControl('', [Validators.required, regexValidator(/.+\@.+\..+/)]),
    'phoneNum': new FormControl('', [Validators.minLength(6), Validators.maxLength(15), regexValidator(/^[0-9]*$/)]),
    'address': new FormControl('', Validators.maxLength(300))
  });

  constructor(
    private staffService: StaffService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userService.getRoles().then((role) => {
      if (role === 'ADMIN') {
        this.possibleRoles = ['STAFF', 'MANAGER', 'ADMIN'];
      } else if (role === 'MANAGER') {
        this.possibleRoles = ['STAFF', 'MANAGER'];
      }
    });
  }

  ngOnInit() {
    if (!Object.keys(typeOfActions).includes(this.type)) {
      throw Error('Type parameter is incorrect or missing');
    }
    this.selectedOperation = typeOfActions[this.type];
    this.loadInputStaff();
  }

  /**
   * Load the inputted staff into the form for updating or viewing
   */
  loadInputStaff() {
    if (this.type === 'add') { return; }
    if (!this.inputStaff) { throw Error('Input staff required if operation is view or update'); }
    if (this.selectedOperation.type === 'edit') {
      this.staffForm.get('email').disable();
    }
    const staffFormValue = { ...this.inputStaff, phoneNum: this.inputStaff.phoneNum.toString() };
    this.staffForm.patchValue(staffFormValue);
  }

  /**
   * Submit the staff for creation or updating
   */
  submitStaff() {
    if (this.type === 'add') {
      this.createStaff();
    } else if (this.type === 'edit') {
      this.editStaff();
    }
  }

  /**
   * Creates a new staff member
   */
  createStaff() {
    if (this.staffForm.invalid) { return; }
    this.isLoading = true;
    const tmpStaff = Object.assign(new Staff, this.staffForm.value);
    this.staffService.createStaff(tmpStaff).then(() => {
      this.isLoading = false;
      this.snackBar.open('Successfully created new staff', null, { duration: 5000 });
    }).catch((err) => {
      this.isLoading = false;
      if (err.code === 'already-exists') {
        this.staffForm.get('email').setErrors({ 'email-taken': true });
        return;
      } else if (err.code === 'invalid-argument') {
        this.staffForm.get('role').setErrors({ 'invalid': true });
        return;
      } else {
        this.snackBar.open('Something went wrong during the account creation of ' + tmpStaff.firstName + ' ' + tmpStaff.lastName +
        '. Please try again later', null, { duration: 10000 });
      }
    });
  }

  /**
   * Update a staff member
   */
  editStaff() {
    if (this.staffForm.invalid) { return; }
    this.isLoading = true;
    const staffFormValue = { ...this.staffForm.value, uid: this.inputStaff.uid };
    this.staffService.updateStaff(staffFormValue as unknown as Staff).then(() => {
      this.snackBar.open('Successfully updated staff', null, { duration: 4000 });
      this.isLoading = false;
    }).catch(() => {
      this.snackBar.open('Something went wrong during update, please try again later', null, { duration: 5000 });
      this.isLoading = false;
    });
  }

  /**
   * Takes a string and makes the first letter uppercase and the rest lowercase
   * @param item a string to convert
   */
  private upperFirstChar(item: string) {
    return item.toLowerCase().charAt(0).toUpperCase() + item.slice(1).toLowerCase();
  }
}

export function regexValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const forbidden = !nameRe.test(control.value);
    return forbidden ? {'invalidFormat': {value: control.value}} : null;
  };
}
