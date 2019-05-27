import { Injectable } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';
import { Observable } from 'rxjs';
import { Developer } from './Developer';

@Injectable({
  providedIn: 'root'
})
export class DevelopersService {

   private elasticType = "developer";
  
  constructor(private elasticService: ElasticsearchService) {
  }

  loadDevelopers(): Observable<Developer[]> {      
     return this.elasticService.getAllDocuments(Developer.name, Developer);
  }

  addDeveloper(developer:Developer): Observable<Developer> {     
       
    return this.elasticService.addDocument(developer);
  }
  deleteDeveloper(developer:Developer): Observable<Developer> {     
    return this.elasticService.deleteDocument(developer);
  }
  updateDeveloper(developer:Developer): Observable<Developer> {     
    return this.elasticService.updateDocument(developer);
  }
}

