import { ShiftLocation } from './shift.service';

export class Shift {
  shiftId: string;
  location: ShiftLocation;
  start: number;
  end: number;
  breakDuration: number;
  note: string;
  onDuty: {};
  date: Date;
  maxStaff: number;

  /** Returns true if shift date has started  */
  hasStarted() {
    if (!this.date) { return false; }
    return this.date['seconds'] ? this.date['seconds'] * 1000 < Date.now() : false;
  }

  /** Returns true if shift has already passed  */
  hasPassed() {
    const shiftLength = (this.end - this.start).toString();
    let additionalSeconds = 0;

    // Convert the shift duration into millis
    if (shiftLength.length <= 2) {
      additionalSeconds = Number.parseInt(shiftLength) * 60;
    } else {
      const sLength = shiftLength.length;
      const minutes = Number.parseInt(shiftLength.substring(sLength - 2, sLength));
      const hours = Number.parseInt(shiftLength.substring(0, sLength - 2));
      additionalSeconds = hours * 3600 + minutes * 60;
    }
    return (this.date['seconds'] + additionalSeconds) * 1000 < Date.now();
  }

  getStatus(uid: string) {
    if (this.onDuty[uid]) {
      return this.onDuty[uid].accepted;
    }
    throw Error('onDuty property missing from Shift');
  }
}
