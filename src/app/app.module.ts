import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TableModule } from 'primeng/table';
import { SharedModule } from 'primeng/components/common/shared';
import { ButtonModule } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ListboxModule } from 'primeng/listbox';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';


import { MsgsComponent } from './msgs/msgs.component';
import { CommonDataComponent } from './common-data/common-data.component';
import { ProjectsComponent } from './projects/projects.component';
import { DevelopersComponent } from './developers/developers.component';
import { TasksComponent } from './tasks/tasks.component';
import { ProgressBarModule } from 'primeng/progressbar';


@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    MsgsComponent,
    CommonDataComponent,
    DevelopersComponent,
    TasksComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    TableModule,
    CommonModule,
    ButtonModule,
    CalendarModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    MessagesModule,
    ListboxModule,
    PanelModule,
    AccordionModule,
    DropdownModule,
    ToggleButtonModule,
    ProgressBarModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
