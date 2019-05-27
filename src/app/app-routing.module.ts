import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';

import { ProjectsComponent } from './projects/projects.component';
import { CommonDataComponent } from './common-data/common-data.component';
import { DevelopersComponent } from './developers/developers.component';

const routes: Routes = [
  {path : '', redirectTo: '/projects', pathMatch: 'full'},
  {path : 'projects', component: ProjectsComponent},
  {path: 'common-data', component: CommonDataComponent},
  {path: 'developers', component: DevelopersComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
