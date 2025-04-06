import { Injectable } from '@angular/core';
import { UserService } from '../user/user.service';
import { Shift } from './shift';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export interface ShiftLocation {
  description: string;
  address: string;
  uid: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private shiftObservable: any; // Declare observable type
  private locationObservable: any; // Declare observable type
  shiftRef: string;
  staffRef: string;
  shiftLocRef: string;
  shifts: Array<Shift> = []; // Initialize as an empty array
  shiftStream = new BehaviorSubject<Shift[]>(null); // Only streams shifts relating to the signed in user
  locations: Array<ShiftLocation> = []; // Initialize as an empty array
  locationStream = new BehaviorSubject<ShiftLocation[]>(null);

  constructor(public userService: UserService, public fireDb: AngularFirestore) {
    this.setupService();
    firebase.auth().onAuthStateChanged((user) => {
      user ? this.setupService() : this.clearService();
    });
  }

  private setupService() {
    this.userService.getOrganisation().then((org) => {
      this.clearService();
      this.shiftRef = 'organisation/' + org['orgId'] + '/shifts';
      this.staffRef = 'organisation/' + org['orgId'] + '/staff';
      this.shiftLocRef = 'organisation/' + org['orgId'] + '/locations';
      this.shiftListener();
      this.locationListener();
    });
  }

  private clearService() {
    this.shifts = []; // Reset shifts array
    this.locations = []; // Reset locations array
    this.shiftStream.next(null); // Emit null to stream
    this.locationStream.next(null); // Emit null to location stream
    if (this.shiftObservable) {
      this.shiftObservable.unsubscribe();
    }
    if (this.locationObservable) {
      this.locationObservable.unsubscribe();
    }
  }

  /**
   * Returns a promise that obtains all locations related to the selected organisation
   */
  getShiftLocations(): Promise<ShiftLocation[]> {
    return new Promise((resolve) => {
      if (this.locations.length) { // Check if the array has items
        resolve(this.locations); // Pass the locations
        return;
      }
      const stream = this.locationStream.subscribe((locations: ShiftLocation[]) => {
        resolve(locations); // Resolve with the received locations
        stream.unsubscribe();
      });
    });
  }

  /**
   * Add a new shift location
   * @param newShiftLoc a new shift location to create
   */
  addShiftLocation(newShiftLoc: ShiftLocation) {
    const tmpLoc = Object.assign({}, newShiftLoc);
    tmpLoc.uid = this.fireDb.createId();
    return this.fireDb.collection(this.shiftLocRef).doc(tmpLoc.uid).set(tmpLoc);
  }

  /**
   * Edit a shift location
   * @param updatedLoc the updated shift location
   */
  editShiftLocation(updatedLoc: ShiftLocation) {
    const tmpLoc = Object.assign({}, updatedLoc);
    return this.fireDb.collection(this.shiftLocRef).doc(updatedLoc.uid).update(tmpLoc);
  }

  /**
   * Remove shift location from organisation
   * @param locationUID UID of shift location
   */
  removeShiftLocation(locationUID: string) {
    return this.fireDb.collection(this.shiftLocRef).doc(locationUID).delete();
  }

  private shiftListener() {
    this.shiftObservable = this.fireDb.collection(this.staffRef).doc(this.userService.uid).valueChanges().subscribe((data) => {
      const tmp: Array<Shift> = []; // Initialize a temporary shifts array
      if (!data.hasOwnProperty('shifts')) {
        this.shiftStream.next([]); // Emit an empty array if no shifts
        return;
      }
      const shiftPromises = data['shifts'].map((shiftRef: any) => {
        return shiftRef.get().then((shiftData: any) => {
          if (shiftData.exists) {
            tmp.push(Object.assign(new Shift(), shiftData.data())); // Assign shift data
          }
        });
      });

      Promise.all(shiftPromises).then(() => {
        this.shifts = tmp;
        this.shiftStream.next(this.shifts); // Emit the shifts after all promises resolve
      });
    });
  }

  private locationListener() {
    this.locationObservable = this.fireDb.collection(this.shiftLocRef).valueChanges().subscribe((locations: ShiftLocation[]) => {
      this.locationStream.next(locations); // Emit locations
    });
  }

  /**
   * Returns a promise that resolves with an observable that provides a stream of all shifts in an organisation
   */
  getAllShifts(): Promise<any> {
    return new Promise((resolve) => {
      this.userService.getOrganisation().then((org) => {
        resolve(this.fireDb.collection('organisation/' + org['orgId'] + '/shifts').valueChanges());
      });
    });
  }

  /**
   * Create a new shift entry in the database
   * @param newShift a new shift entry to add to the database
   */
  createShift(newShift: Shift): Promise<void> {
    const batch = this.fireDb.firestore.batch();

    return new Promise((resolve, reject) => {
      if (!newShift.onDuty) { 
        reject('onDuty property missing from Shift'); 
        return; // Ensure early return on rejection
      }
      const tmpShift = Object.assign({}, newShift);
      tmpShift.shiftId = this.fireDb.createId();
      this.fireDb.collection(this.shiftRef).doc(tmpShift.shiftId).set(tmpShift).then(() => {
        // Add a reference to the shift for all related staff
        for (const uid in newShift.onDuty) {
          if (newShift.onDuty.hasOwnProperty(uid)) {
            const staffRef = this.fireDb.firestore.collection(this.staffRef).doc(uid);
            batch.update(staffRef, {
              shifts: firebase.firestore.FieldValue.arrayUnion(this.fireDb.collection(this.shiftRef).doc(tmpShift.shiftId).ref)
            });
          }
        }
        batch.commit().then(() => resolve()).catch((err) => reject(err));
      }).catch((err) => reject(err));
    });
  }

  /**
   * Update a shift entry in the database
   * @param updatedShift an updated shift entry
   */
  updateShift(updatedShift: Shift): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!updatedShift.onDuty) { 
        reject('onDuty property missing from Shift'); 
        return; // Ensure early return on rejection
      }

      this.fireDb.collection(this.shiftRef).doc(updatedShift.shiftId).update(
        Object.assign({}, updatedShift)
      ).then(() => {
        resolve(); // Resolve without error
      }).catch((err) => reject(err));
    });
  }

  /**
   * Remove a shift entry from the database
   * @param shift a shift entry to remove from the database
   */
  deleteShift(shift: Shift): Promise<void> {
    const batch = this.fireDb.firestore.batch();

    return new Promise((resolve, reject) => {
      if (!shift.shiftId) { 
        reject('ShiftId property missing from Shift'); 
        return; // Ensure early return on rejection
      }
      if (!shift.onDuty) { 
        reject('onDuty property missing from Shift'); 
        return; // Ensure early return on rejection
      }

      // Delete the shift from the organisation's collection
      const shiftToDelete = this.fireDb.firestore.collection(this.shiftRef).doc(shift.shiftId);
      shiftToDelete.delete()
      .then(() => {
        // Remove all references of the shift from staff collection
        for (const uid in shift.onDuty) {
          if (shift.onDuty.hasOwnProperty(uid)) {
            const staffRef = this.fireDb.firestore.collection(this.staffRef).doc(uid);
            batch.update(staffRef, {
              shifts: firebase.firestore.FieldValue.arrayRemove(shiftToDelete)
            });
          }
        }
        batch.commit().then(() => resolve()).catch((err) => reject(err));
      }).catch((err) => reject(err));
    });
  }

  /**
   * Accept a shift. Returns a Promise resolving if successful, rejecting otherwise
   * @param shift a shift to accept
   */
  acceptShift(shift: Shift): Promise<void> {
    return this.acceptDeclineShift(shift, true);
  }

  /**
   * Decline a shift. Returns a Promise resolving if successful, rejecting otherwise
   * @param shift a shift to decline
   */
  declineShift(shift: Shift): Promise<void> {
    return this.acceptDeclineShift(shift, false);
  }

  private acceptDeclineShift(shift: Shift, decision: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!shift.shiftId) { 
        reject('ShiftId property missing from Shift'); 
        return; // Ensure early return on rejection
      }
      const tmp = {};
      tmp['onDuty.' + this.userService.uid + '.accepted'] = decision;
      this.fireDb.collection(this.shiftRef).doc(shift.shiftId).update(tmp).then(() => {
        resolve(); // Resolve without error
        this.updateShifts();
      }).catch((err) => reject(err));
    });
  }

  private updateShifts() {
    if (this.shiftObservable) {
      this.shiftObservable.unsubscribe();
    }
    this.shiftListener(); // Restart shift listener
  }

  /**
   * Returns a promise that resolves with a list of shifts related to the user
   */
  getShifts(): Promise<Shift[]> {
    return new Promise((resolve) => {
      if (this.shifts.length) {
        resolve(this.shifts); // Pass the shifts data
        return;
      }
      const stream = this.shiftStream.subscribe((shiftData) => {
        if (stream) {
          resolve(shiftData); // Pass the shift data
          stream.unsubscribe();
        }
      });
    });
  }

  /**
   * Filter a list of shifts into pending, upcoming and total categories
   * @param shifts a list of shifts to filter
   */
  filterShifts(shifts: Shift[]) {
    if (!shifts) { return; }
    const pendingShifts: Shift[] = [];
    const upcomingShifts: Shift[] = [];
    const uid = this.userService.uid;
    shifts.forEach(aShift => {
      const status = aShift.getStatus(uid);
      if (status == null && !aShift.hasStarted()) {
        pendingShifts.push(aShift);
      } else if (status && !aShift.hasPassed()) {
        upcomingShifts.push(aShift);
      }
    });

    return {
      pending: pendingShifts,
      upcoming: upcomingShifts,
      total: shifts.slice()
    };
  }
}
