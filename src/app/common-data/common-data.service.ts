import { Injectable } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';
import { Observable } from 'rxjs';
import { CommonData } from './common-data';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService extends BaseService {

  constructor(elasticService: ElasticsearchService) {
    super(elasticService);
  }

  getCommonData(): Observable<CommonData[]> {
    return this.elasticService.getAllDocuments(CommonData.name, CommonData);
  }
  addData(commonData: CommonData): Observable<any> {
    return this.elasticService.addDocument(commonData);
  }
  upsertData(commonData: CommonData): Observable<any> {
    if (commonData.id) {
      return this.elasticService.updateDocument(commonData);
    } else {
      return this.addData(commonData);
    }
  }
  deleteData(commonData: CommonData): Observable<any> {
    return this.elasticService.deleteDocument(commonData);
  }

}
