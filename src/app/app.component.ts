import { Component } from '@angular/core';
import { MsgsComponent } from './msgs/msgs.component'
import { CommonDataComponent } from './common-data/common-data.component'
import { TasksComponent } from './tasks/tasks.component';
import { DevelopersComponent } from './developers/developers.component';
import { TaskDialogComponent } from './tasks/task-dialog/task-dialog.component';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, Router, GuardsCheckEnd } from '@angular/router';
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';

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

  @LocalStorage() isAdmin: boolean;
  @LocalStorage() user: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private msgsComponent: MsgsComponent, private localStorage: LocalStorageService) {
    this.isAdmin = false;
  }

  ngOnInit() {
    this.items = [
      { label: 'Calendar', icon: 'pi pi-calendar', routerLink: 'task-calendar' },
      { label: 'Task', icon: 'pi pi-list', routerLink: 'tasks' },
      { label: 'Projects', icon: 'pi pi-folder', routerLink: 'projects' },
      { label: 'Releases', icon: 'pi pi-bell', routerLink: 'releases' },
      { label: 'Team-Task', icon: 'pi pi-sitemap', routerLink: 'team-tasks' },
      { label: 'Support', icon: 'pi pi-info-circle', routerLink: 'new' }
    ];

    var obs = this.router.events.subscribe(event => {
      if (event instanceof GuardsCheckEnd) {
        var guardsCheckEvent = event;
        this.isAdmin = event.state.root.queryParams['admin'] == "admin";
        this.user = event.state.root.firstChild.params['user'];
        obs.unsubscribe();
        if (this.isAdmin) {
          this.items.push({ label: 'Developer', icon: 'pi pi-users', routerLink: 'developers' });
          this.items.push({ label: 'Common', icon: 'pi pi-th-large', routerLink: 'common-data' });
        }


      }
    });

    this.activeItem = this.items[0];


    // this.developer = this.navigationEnd.snapshot.queryParams('developer');
  }
}

