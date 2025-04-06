import { Component, OnInit } from '@angular/core';

const tmpMessages = [
  {
    title: 'Some message title!',
    name: 'John Doe',
    date: '6:15PM 25/03/18'
  },
  {
    title: 'Please remember to do x!',
    name: 'Peter Johnson',
    date: '3:30PM 23/03/18'
  },
  {
    title: 'Hello world!',
    name: 'Peter Johnson',
    date: '2:05AM 2/03/18'
  }
];

@Component({
  selector: 'app-message-board',
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.scss']
})
export class MessageBoardComponent implements OnInit {
  messages = tmpMessages;

  constructor() { }

  ngOnInit() {
  }

}
