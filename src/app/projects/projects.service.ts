import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { Project } from './Project';
import { ElasticsearchService } from '../elasticsearch.service';
import { BaseService } from '../base-service';
import { LocalStorageService } from 'angular-web-storage';


@Injectable({
  providedIn: 'root'
})
export class ProjectsService extends BaseService {
  
  elasticType = "project";

  constructor(elasticService: ElasticsearchService, localStorage: LocalStorageService) {
    super(elasticService);
  }

  loadProjects(): Observable<Project[]> {
    return this.elasticService.getAllDocuments(Project.name, Project);
  }
  addProject(project: Project): Observable<Project> {
    this.setAuditData(project);
    return this.elasticService.addDocument(project);
  }
  deleteProject(project: Project): Observable<Project> {
    return this.elasticService.deleteDocument(project);
  }
  updateProject(project: Project): Observable<Project> {
    this.setAuditData(project);
    return this.elasticService.updateDocument(project);
  }
  getOpenProjects(): Observable<Project[]> {
    return this.getWithFieldValueInType(Project, "status", ["Open"]);
  }
  getProjectsWithStatus(status): Observable<Project[]> {
    return this.getWithFieldValueInType(Project, "status", [status]);
  }

  getNotClosedProjects(): Observable<Project[]> {
    return this.getWithFieldValueNotInType(Project, 'status', ["Closed"]);
  }

  getProjectsForRelease(release: string) {
    return this.getWithFieldValueInType(Project, "release", [release]);
  }

}
