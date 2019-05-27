import { Injectable } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';
import { Task } from './task';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private elasticType = "task";

  constructor(private elasticService: ElasticsearchService) {
  }

  loadDevelopers(): Observable<Task[]> {
    return this.elasticService.getAllDocuments(Task.name, Task);
  }

  addDeveloper(task: Task): Observable<Task> {

    return this.elasticService.addDocument(task);
  }
  deleteDeveloper(task: Task): Observable<Task> {
    return this.elasticService.deleteDocument(task);
  }
  updateDeveloper(task: Task): Observable<Task> {
    return this.elasticService.updateDocument(task);
  }
}
