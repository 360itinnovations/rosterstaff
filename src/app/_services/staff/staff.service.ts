import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../user/user.service';
import { BehaviorSubject, Subscription } from 'rxjs';

export class Staff {
  uid: string;
  firstName: string;
  lastName: string;
  role: string;
  shifts: string[];
  phoneNum: number;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private staffObservable: Subscription;
  private staffRef: string;
  organisation: string = '';
  staffMembers: Staff[] = [];
  staffStream = new BehaviorSubject<Staff[]>([]);

  constructor(
    public userService: UserService,
    public fireDb: AngularFirestore,
    public fireAuth: AngularFireAuth,
    private fireFunc: AngularFireFunctions
  ) {
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.userService.getOrganisation().then((org) => {
          this.organisation = org['orgId'];
          this.staffRef = `organisation/${this.organisation}/staff`;
          this.staffListener();
        });
      } else {
        this.clearService();
      }
    });
  }

  private clearService() {
    this.staffMembers = [];
    this.staffStream.next([]);
    if (this.staffObservable) {
      this.staffObservable.unsubscribe();
    }
    this.organisation = '';
  }

  private staffListener() {
    this.staffObservable = this.fireDb
      .collection<Staff>(this.staffRef)
      .snapshotChanges()
      .subscribe((data) => {
        const tmpArray: Staff[] = data.map(staffMember => {
          const staffData = staffMember.payload.doc.data() as Staff;
          return {
            ...staffData,
            uid: staffMember.payload.doc.id
          };
        });
        this.staffMembers = tmpArray;
        this.staffStream.next(this.staffMembers);
      });
  }

  getAllStaff(): Promise<Staff[]> {
    return new Promise((resolve) => {
      if (this.staffMembers.length === 0) {
        const tmpRef = this.staffStream.subscribe((staff) => {
          if (staff && staff.length > 0) {
            resolve(staff);
            tmpRef.unsubscribe();
          }
        });
      } else {
        resolve(this.staffMembers);
      }
    });
  }

  getStaff(uid: string): Promise<Staff> {
    return new Promise((resolve, reject) => {
      const tmpStream = this.staffStream.subscribe((staffMembers) => {
        if (staffMembers) {
          const match = staffMembers.find((staff) => staff.uid === uid);
          if (match) {
            resolve(match);
          } else {
            reject(`Staff member with uid ${uid} not found`);
          }
          tmpStream.unsubscribe();
        }
      });
    });
  }

  createStaff(newStaff: Staff): Promise<any> {
    return this.fireFunc.httpsCallable('createStaff')(newStaff).toPromise();
  }

  deleteStaff(staffUid: string): Promise<any> {
    return this.fireFunc.httpsCallable('deleteStaff')({ uid: staffUid }).toPromise();
  }

  updateStaff(updatedStaff: Staff): Promise<void> {
    if (!updatedStaff || !updatedStaff.uid) {
      return Promise.reject('Invalid staff data provided.');
    }

    const objStaff = { ...updatedStaff };
    delete objStaff.email; // Optional: remove email if it's immutable

    return this.fireDb.collection(this.staffRef).doc(objStaff.uid).update(objStaff);
  }
}
