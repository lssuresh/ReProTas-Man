import { Component, OnInit, Injectable } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { timer } from 'rxjs/internal/observable/timer';


@Component({
  selector: 'app-msgs',
  templateUrl: './msgs.component.html',
  styleUrls: ['./msgs.component.css']
})

@Injectable()
export class MsgsComponent implements OnInit {

  constructor(private messageService: MessageService) { }

  ngOnInit() {
  }

  showError(msg) {
    this.messageService.clear();
    this.messageService.add({
      severity: 'warn', summary: 'Error',
      detail: msg
    });
  }

  showInfo(msg) {
    this.messageService.clear();
    this.messageService.add({
      severity: 'Info', summary: 'Info',
      detail: msg
    });

    this.clearWithTimer();
  }

  showWarn(msg) {
    this.messageService.clear();
    this.messageService.add({
      severity: 'warn', summary: 'Warn',
      detail: msg
    });
    this.clearWithTimer();
  }
  clear() {
    this.messageService.clear();
  }

  clearWithTimer() {
    let source = timer(2000);
    source.subscribe(t => {
      this.clear();
    });
  }

}
