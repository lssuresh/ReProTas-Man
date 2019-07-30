import { Component } from '@angular/core';
import { MsgsComponent } from './msgs/msgs.component'
import { CommonDataComponent } from './common-data/common-data.component'
import { TasksComponent } from './tasks/tasks.component';
import { DevelopersComponent } from './developers/developers.component';
import { TaskDialogComponent } from './tasks/task-dialog/task-dialog.component';
import { MenuItem } from 'primeng/api';
import { Developer } from './developers/Developer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css'
  ],
  providers: [MsgsComponent, CommonDataComponent, TasksComponent, DevelopersComponent, TaskDialogComponent]
})
export class AppComponent {
  title = 'ReProTas Management';
  elastic_url = '';

  items: MenuItem[];
  activeItem: MenuItem;
  isAdmin: boolean;
  developer: string;

  constructor(private msgsComponent: MsgsComponent) {
    this.isAdmin = false;
  }

  ngOnInit() {
    this.items = [
      { label: 'Projects', icon: 'pi pi-folder', routerLink: 'projects' },
      { label: 'Releases', icon: 'pi pi-bell', routerLink: 'releases' },
      { label: 'Task', icon: 'pi pi-list', routerLink: 'tasks' },
      { label: 'Team-Task', icon: 'pi pi-sitemap', routerLink: 'team-tasks' },
      { label: 'Calendar', icon: 'pi pi-calendar', routerLink: 'task-calendar' },
      { label: 'Support', icon: 'pi pi-ticket', routerLink: 'new' },
      { label: 'Developers', icon: 'pi pi-users', routerLink: 'developers' },
      { label: 'Common', icon: 'pi pi-th-large', routerLink: 'common-data' },
    ];
  }

}

