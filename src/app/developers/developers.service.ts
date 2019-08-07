import { Injectable } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';
import { Observable } from 'rxjs';
import { Developer } from './Developer';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root'
})
export class DevelopersService extends BaseService {

  elasticType = "developer";

  constructor(elasticService: ElasticsearchService) {
    super(elasticService);
  }

  loadDevelopers(): Observable<Developer[]> {
    return this.elasticService.getAllDocuments(Developer.name, Developer);
  }
  addDeveloper(developer: Developer): Observable<Developer> {
    this.setAuditData(developer);
    return this.elasticService.addDocument(developer);
  }
  deleteDeveloper(developer: Developer): Observable<Developer> {
    return this.elasticService.deleteDocument(developer);
  }
  updateDeveloper(developer: Developer): Observable<Developer> {
    this.setAuditData(developer);
    return this.elasticService.updateDocument(developer);
  }
  getActiveDevelopers(): Observable<Developer[]> {
    return this.getWithFieldValueInType(Developer, "status", ["Active"]);
  }
  getDeveloperWithName(name: string): Observable<Developer> {
    return this.getWithFieldValueInType(Developer, "name", [name]);
  }
}