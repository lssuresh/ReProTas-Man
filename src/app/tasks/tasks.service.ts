import { Injectable } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';
import { Task } from './task';
import { Observable } from 'rxjs';

import { ProjectsService } from '../projects/projects.service';
import { DevelopersService } from '../developers/developers.service';
import { Developer } from '../developers/Developer';
import { Project } from '../projects/Project';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root'
})
export class TasksService extends BaseService {

  elasticType = "task";

  constructor(elasticService: ElasticsearchService,
    private projectService: ProjectsService,
    private developersService: DevelopersService) {
    super(elasticService);
  }

  loadTasks(): Observable<Task[]> {
    return this.elasticService.getAllDocuments(Task.name, Task)
  }

  addTask(task: Task): Observable<Task> {
    this.setAuditData(task);
    return this.elasticService.addDocument(task);
  }
  deleteTask(task: Task): Observable<Task> {
    return this.elasticService.deleteDocument(task);
  }
  updateTask(task: Task): Observable<Task> {
    this.setAuditData(task);
    return this.elasticService.updateDocument(task);
  }
  addOrUpdate(task: Task): Observable<Task> {
    this.setAuditData(task);
    if (!task.id) {
      return this.addTask(task);
    } else {
      return this.updateTask(task);
    }
  }
  getOpenTasks(): Observable<Task[]> {
    return this.elasticService.matchNotInValue(Task, "status", ["Closed", "Archived"]);
  }
  getOpenTasksBetweenDates(rangeStart: Date, rangeEnd: Date): Observable<Task[]> {
    return this.elasticService.matchNotInValueAndRange(Task, "status", ["Closed", "Archived"], 'start_date', rangeStart, rangeEnd)
  }

  // does not retrieve the closed and archived task.
  getTasksForRelease(release) {
    var eq = this.elasticService.createMatchValueFilter(null, "release", [release]);
    eq = this.elasticService.createMatchValueNotInFilter(eq, "status", ["Closed", "Archived"]);
    return this.elasticService.postWithQuery(Task, eq);
  }

  // will not retrieve closed and archived.
  getTasksForDev(developerId) {
    var eq = this.elasticService.createMatchValueFilter(null, "developer", [developerId]);
    eq = this.elasticService.createMatchValueNotInFilter(eq, "status", ["Archived"]);
    return this.elasticService.postWithQuery(Task, eq);
  }
}
