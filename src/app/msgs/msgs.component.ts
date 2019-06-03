import { Component, OnInit, Injectable } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';


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
  }

  showWarn(msg) {
    this.messageService.clear();
    this.messageService.add({
      severity: 'warn', summary: 'Warn',
      detail: msg
    });
  }
  clear() {
    this.messageService.clear();
  }


}
