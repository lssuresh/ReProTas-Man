import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectsComponent } from './projects/projects.component';
import { CommonDataComponent } from './common-data/common-data.component';
import { DevelopersComponent } from './developers/developers.component';
import { TasksComponent } from './tasks/tasks.component';
import { TeamTasksComponent } from './team-tasks/team-tasks.component';
import { ReleaseComponent } from './release/release.component';
import { TaskCalendarComponent } from './task-calendar/task-calendar.component';

const routes: Routes = [

  { path: 'login/:user', component: TaskCalendarComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'common-data', component: CommonDataComponent },
  { path: 'developers', component: DevelopersComponent },
  { path: 'tasks', component: TasksComponent, runGuardsAndResolvers: `always` },
  { path: 'team-tasks', component: TeamTasksComponent },
  { path: 'releases', component: ReleaseComponent },
  { path: 'team-calendar', component: TaskCalendarComponent, },
  { path: 'my-calendar', component: TaskCalendarComponent, },
  { path: '**', redirectTo: 'team-calendar' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true, onSameUrlNavigation: `reload` })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
