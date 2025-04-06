import { Component, OnInit, Input, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ShiftService } from 'src/app/_services/shift/shift.service';
import { Shift } from 'src/app/_services/shift/shift';
import { Router } from '@angular/router';

const types = {
  pending: {
    text: 'Avaliable Shifts',
    cardColor: '#aedd94'
  },
  upcoming: {
    text: 'Upcoming Shifts',
    cardColor: '#64b5f6'
  },
  total: {
    text: 'Total Shifts',
    cardColor: '#ffb74d'
  }
};

@Component({
  selector: 'app-shift-dashboard-card',
  templateUrl: './shift-dashboard-card.component.html',
  styleUrls: ['./shift-dashboard-card.component.scss']
})
export class ShiftDashboardCardComponent implements OnInit, OnDestroy {
  @Input() cardType: string;
  @ViewChild('card') cardRef: ElementRef;
  private tmpSub;
  shiftNumber = 0;
  shiftText: string;

  constructor(private shiftService: ShiftService, private router: Router) {}

  ngOnInit() {
    if (!Object.keys(types).includes(this.cardType)) {
      throw new Error('Input cardType parameter is invalid');
    }
    this.shiftText = types[this.cardType].text;
    this.cardRef.nativeElement.style.backgroundColor = types[this.cardType].cardColor;
    this.shiftListener();
  }

  ngOnDestroy() {
    if (this.tmpSub) {
      this.tmpSub.unsubscribe();
    }
  }

  shiftListener() {
    this.tmpSub = this.shiftService.shiftStream.subscribe((shifts: Shift[]) => {
      if (!shifts) {
        return;
      }
      try {
        const tmp = this.shiftService.filterShifts(shifts);
        this.shiftNumber = tmp[this.cardType].length;
      } catch {
        this.shiftNumber = 0;
      }
    });
  }

  navigate() {
    this.router.navigate(['/staff/shifts']);
    // Todo: Navigate to the correct tab on shifts page
  }
}
