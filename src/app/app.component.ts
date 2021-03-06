import { Component } from '@angular/core';
import { MsgsComponent } from './msgs/msgs.component'
import { CommonDataComponent } from './common-data/common-data.component'
import { TasksComponent } from './tasks/tasks.component';
import { TaskDialogComponent } from './tasks/task-dialog/task-dialog.component';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, Router, GuardsCheckEnd } from '@angular/router';
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';
import { LocalStorageLabel } from './LocalStorageLabel';
import { DevelopersService } from './developers/developers.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css'
  ],
  providers: [MsgsComponent, CommonDataComponent, TasksComponent, TaskDialogComponent]
})
export class AppComponent {

  title = 'ReProTas Management';
  elastic_url = '';

  items: MenuItem[];
  activeItem: MenuItem;
  userName: string;

  @LocalStorage() isAdmin: boolean;
  @LocalStorage() user: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private msgsComponent: MsgsComponent,
    private localStorage: LocalStorageService, private developerService: DevelopersService) {
    this.isAdmin = false;
    this.localStorage.set(LocalStorageLabel.USER, '');
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
        this.isAdmin = event.state.root.queryParams[LocalStorageLabel.IS_ADMIN] == "admin";
        this.userName = event.state.root.firstChild.params[LocalStorageLabel.USER];
        obs.unsubscribe();
        if (this.isAdmin) {
          this.items.push({ label: 'Users', icon: 'pi pi-users', routerLink: 'users' });
          this.items.push({ label: 'Common', icon: 'pi pi-th-large', routerLink: 'common-data' });
        }
        this.validateUser();
      }
    });

    this.activeItem = this.items[0];
  }

  validateUser() {
    this.developerService.getDeveloperWithUserId(this.userName).subscribe(dev => {
      if (!dev || dev.length == 0) {
        this.msgsComponent.showError("User invalid...please try again");
        this.user = null;
        this.router.navigate(['/']);
      } else {
        this.user = dev[0].userId;
        this.router.navigate(['/', 'my-calendar']);
      }
    });

  }
}

