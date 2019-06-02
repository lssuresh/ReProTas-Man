import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectsComponent } from './projects/projects.component';
import { CommonDataComponent } from './common-data/common-data.component';
import { DevelopersComponent } from './developers/developers.component';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'projects', component: ProjectsComponent },
  { path: 'common-data', component: CommonDataComponent },
  { path: 'developers', component: DevelopersComponent },
  { path: 'tasks', component: TasksComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
