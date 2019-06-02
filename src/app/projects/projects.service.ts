import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { Project } from './Project';
import { ElasticsearchService } from '../elasticsearch.service';
import { BaseService } from '../base-service';


@Injectable({
  providedIn: 'root'
})
export class ProjectsService extends BaseService {

  elasticType = "project";

  constructor(elasticService: ElasticsearchService) {
    super(elasticService);
  }

  loadProjects(): Observable<Project[]> {
    return this.elasticService.getAllDocuments(Project.name, Project);
  }
  addProject(project: Project): Observable<Project> {
    return this.elasticService.addDocument(project);
  }
  deleteProject(project: Project): Observable<Project> {
    return this.elasticService.deleteDocument(project);
  }
  updateProject(project: Project): Observable<Project> {
    return this.elasticService.updateDocument(project);
  }
  getOpenProjects(): Observable<Project[]> {
    return this.getWithFieldValueInType(Project, "status", "Open");
  }
}
