import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-shift-view',
  templateUrl: './shift-view.component.html',
  styleUrls: ['./shift-view.component.scss'],
  imports:[MatIcon]
})
export class ShiftViewComponent {
  @Input() data;
  @Input() allowAccept;
  showList = true;

  constructor() { }
}
