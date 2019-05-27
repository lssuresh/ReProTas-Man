import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import {MsgsComponent}  from './msgs/msgs.component'
import {CommonDataComponent} from './common-data/common-data.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css'         
    ],
    providers: [MsgsComponent, CommonDataComponent] 
})
export class AppComponent {
  title = 'ReProTas';  
  elastic_url='';
  
  constructor(private msgsComponent: MsgsComponent){}

 }
 
