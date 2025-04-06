import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Subject, Subscription } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export class Profile {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phoneNum: string = '';
  role: string = '';
  address: string = '';
  shifts: string[] = [];
  isReady: boolean = false;
}

class Organisation {
  isReady: boolean = false;
  selectedOrg: string = 'Company';
  orgId: string | null = null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  dataStream = new Subject();
  profile = new Profile();
  profileSubscription: Subscription;
  org = new Organisation();
  uid = '';

  constructor(
    private fireAuth: AngularFireAuth,
    private fireDb: AngularFirestore,
    private fireStg: AngularFireStorage
  ) {
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.uid = user.uid;

        const toUnsub = this.fireDb.collection('users').doc(user.uid).valueChanges().subscribe((doc: any) => {
          if (doc?.organisation?.id) {
            this.loadUserData(doc.organisation.id).then(() => {
              this.org.isReady = true;
              this.dataStream.next('orgLoaded');
            });
          } else {
            throw new Error('User missing organisation data');
          }
          toUnsub.unsubscribe();
        });
      } else {
        this.profile = new Profile();
        this.uid = '';
        this.org = new Organisation();
        if (this.profileSubscription) {
          this.profileSubscription.unsubscribe();
        }
      }
    });
  }

  updateProfile(updatedProfile: Profile) {
    if (!this.profile.isReady) {
      throw new Error('Service is not yet configured');
    }
    const orgId = this.org.orgId;
    return this.fireDb
      .collection(`organisation/${orgId}/staff`)
      .doc(this.uid)
      .update(updatedProfile);
  }

  getOrganisation(): Promise<Organisation> {
    return new Promise((resolve) => {
      if (this.org.isReady) {
        resolve(this.org);
      } else {
        const tmp = this.dataStream.subscribe((stream) => {
          if (stream === 'orgLoaded') {
            resolve(this.org);
            tmp.unsubscribe();
          }
        });
      }
    });
  }

  getRoles(): Promise<string> {
    return new Promise((resolve) => {
      if (this.profile.isReady) {
        resolve(this.profile.role);
      } else {
        const tmp = this.dataStream.subscribe((data) => {
          if (data === 'profileLoaded') {
            resolve(this.profile.role);
            tmp.unsubscribe();
          }
        });
      }
    });
  }

  loadUserData(organisation: string) {
    return Promise.all([
      this.getOrgData(organisation),
      this.getProfile(organisation)
    ]);
  }

  private getProfile(organisation: string): Promise<void> {
    const staffRef = `organisation/${organisation}/staff`;
    return new Promise((resolve) => {
      this.profileSubscription = this.fireDb.collection(staffRef).doc(this.uid).valueChanges().subscribe((doc: any) => {
        this.profile = doc as Profile;
        this.profile.isReady = true;
        this.dataStream.next('profileLoaded');
        resolve();
      });
    });
  }

  private getOrgData(organisation: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const toUnsub = this.fireDb.collection('organisation').doc(organisation).valueChanges().subscribe((doc: any) => {
        if (!doc?.name) {
          reject('Unable to find organisation');
        }
        this.org.orgId = organisation;
        this.org.selectedOrg = doc.name;
        resolve();
        toUnsub.unsubscribe();
      }, (err) => reject(err));
    });
  }

  getFullName(): string {
    return this.profile ? `${this.profile.firstName} ${this.profile.lastName}` : '';
  }

  reauthenticateUser(password: string): Promise<void> {
    const user = this.fireAuth.currentUser;
    return user.then(currentUser => {
      if (!currentUser || !currentUser.email) {
        return Promise.reject('User not signed in');
      }
      const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
      return currentUser.reauthenticateWithCredential(credential).then(() => { });
    });
  }

  updateProfilePicture(picture: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.fireAuth.currentUser) {
        reject('User not signed in');
        return;
      }

      if (picture.size >= 3 * 1024 * 1024) {
        reject('storage/max_file_size');
        return;
      }

      this.fireAuth.currentUser.then(user => {
        if (!user) {
          reject('User not signed in');
          return;
        }

        const path = `${user.uid}/profile/picture`;
        const ref = this.fireStg.ref(path);

        ref.put(picture).then((uploadResult) => {
          uploadResult.ref.getDownloadURL().then((url) => {
            user.updateProfile({ displayName: '', photoURL: url })
              .then(() => resolve())
              .catch((err) => reject(err.code));
          });
        }).catch((err) => reject(err.code));
      });
    });
  }

  deleteProfilePicture(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fireAuth.currentUser.then(user => {
        if (!user) {
          reject('User not signed in');
          return;
        }

        if (!user.photoURL) {
          resolve();
          return;
        }

        const path = `${user.uid}/profile/picture`;
        const ref = this.fireStg.ref(path);

        const deletePromise = ref.delete().toPromise().catch(() => { });
        const updateProfilePromise = user.updateProfile({ displayName: '', photoURL: null });

        Promise.all([deletePromise, updateProfilePromise])
          .then(() => resolve())
          .catch((err) => reject(err));
      });
    });
  }

  getProfilePicture(): string | null {
    const user = firebase.auth().currentUser;
    return user?.photoURL ?? null;
  }
}
