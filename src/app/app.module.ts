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
import { ButtonModule, ConfirmationService, MultiSelectModule } from 'primeng/primeng';
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
import { ContextMenuModule } from 'primeng/contextmenu';
import { MsgsComponent } from './msgs/msgs.component';
import { CommonDataComponent } from './common-data/common-data.component';
import { ProjectsComponent } from './projects/projects.component';
import { DevelopersComponent } from './developers/developers.component';
import { TasksComponent } from './tasks/tasks.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DateFormatPipe } from './DatePipe';
import { TeamTasksComponent } from './team-tasks/team-tasks.component';
import { TaskDialogComponent } from './tasks/task-dialog/task-dialog.component';
import { ReleaseComponent } from './release/release.component'
import { TreeModule } from 'primeng/tree';

@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    MsgsComponent,
    CommonDataComponent,
    DevelopersComponent,
    DateFormatPipe,
    TasksComponent,
    TeamTasksComponent,
    TaskDialogComponent,
    ReleaseComponent
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
    MultiSelectModule,
    ToggleButtonModule,
    ProgressBarModule,
    ContextMenuModule,
    ConfirmDialogModule,
    TreeModule
  ],
  providers: [MessageService, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
