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
    return this.elasticService.addDocument(task);
  }
  deleteTask(task: Task): Observable<Task> {
    return this.elasticService.deleteDocument(task);
  }
  updateTask(task: Task): Observable<Task> {
    return this.elasticService.updateDocument(task);
  }
  addOrUpdate(task: Task): Observable<Task> {
    if (!task.id) {
      return this.addTask(task);
    } else {
      return this.updateTask(task);
    }
  }
  getOpenTasks(): Observable<Task[]> {
    return this.elasticService.matchNotInValue(Task, "status", ["Closed"]);
  }
  getOpenTasksBetweenDates(rangeStart: Date, rangeEnd: Date): Observable<Task[]> {
    return this.elasticService.matchNotInValueAndRange(Task, "status", ["Closed"], 'start_date', rangeStart, rangeEnd)
  }

  getTasksForRelease(release) {
    return this.elasticService.matchValue(Task, "release", [release]);
  }

  getTasksForDev(developerId) {
    return this.elasticService.matchValue(Task, "developer", [developerId]);
  }
}
