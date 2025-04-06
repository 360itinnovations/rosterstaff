import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ShiftLocation, ShiftService } from '../../../_services/shift/shift.service';
import { MatFormField } from '@angular/material/input';

const editLocation = {
  title: 'Update Location',
  action: 'Update Location',
  type: 'edit'
};

const addLocation = {
  title: 'Add New Location',
  action: 'Add Location',
  type: 'add'
};

@Component({
  selector: 'app-create-update-location',
  templateUrl: './create-update-location.component.html',
  styleUrls: ['./create-update-location.component.scss'],
  imports:[MatFormField, ReactiveFormsModule]

})
export class CreateUpdateLocationComponent {
  locationForm = new FormGroup({
    'description': new FormControl('', [Validators.required, Validators.maxLength(300)]),
    'address': new FormControl('', [Validators.required, Validators.maxLength(300)])
  });

  isLoading = false;
  title: string;
  dialogDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateUpdateLocationComponent>,
    public shiftService: ShiftService,
    public snackBar: MatSnackBar
  ) {
    if (!Object.keys(data).includes('type')) {
      throw Error('Action type must be passed in');
    }

    if (data['type'] === 'add') {
      this.dialogDetails = addLocation;
    } else if (data['type'] === 'edit') {
      this.dialogDetails = editLocation;
      this.locationForm.get('description').setValue(data.location.description);
      this.locationForm.get('address').setValue(data.location.address);
    }
  }

  submitLocation() {
    if (this.dialogDetails.type === 'add') {
      this.addLocation();
    } else if (this.dialogDetails.type === 'edit') {
      this.editLocation();
    }
  }

  editLocation() {
    if (this.locationForm.invalid) { return; }
    this.isLoading = true;
    const updatedLoc = this.locationForm.value as { description: string; address: string; uid?: string };
    updatedLoc.uid = this.data.location.uid;
    this.shiftService.editShiftLocation(updatedLoc as ShiftLocation).then(() => {
      this.isLoading = false;
      this.snackBar.open('Location Updated!', null, { duration: 3000 });
      this.dialogRef.close(updatedLoc);
    }).catch((err) => {
      this.isLoading = false;
      this.snackBar.open('There was a problem updating the location. Please try again later.', null, { duration: 5000 });
    });
  }

  addLocation() {
    if (this.locationForm.invalid) { return; }
    this.isLoading = true;
    const newLocation = this.locationForm.value;
    this.shiftService.addShiftLocation(newLocation  as ShiftLocation).then(() => {
      this.isLoading = false;
      this.snackBar.open('New location added!', null, { duration: 3000 });
      this.dialogRef.close(newLocation);
    }).catch((err) => {
      this.isLoading = false;
      this.snackBar.open('There was a problem adding a new location. Please try again later.', null, { duration: 5000 });
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
