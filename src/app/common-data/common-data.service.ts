import { Injectable } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';
import { Observable } from 'rxjs';
import { CommonData } from './common-data';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {


   constructor(private elasticService: ElasticsearchService){}

   getCommonData(): Observable<CommonData>{
    return this.elasticService.getAllDocuments(CommonData.name, CommonData);
  }  
  addData(commonData: CommonData):Observable<any>{
    return this.elasticService.addDocument(commonData );
  }
  upsertData(commonData:CommonData): Observable<any>{
    if(commonData.id){
      return this.elasticService.updateDocument(commonData);
    }else{
      return this.addData(commonData);
    }
  } 
  deleteData(commonData:CommonData): Observable<any>{
    return this.elasticService.deleteDocument(commonData);
  }

}
