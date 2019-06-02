import { ElasticsearchService } from './elasticsearch.service';
import { Observable } from 'rxjs';

export class BaseService {

    elasticType: string;

    elasticService: ElasticsearchService;

    constructor(elasticService: ElasticsearchService) {
        this.elasticService = elasticService;
    }

    getWithId<T>(id: string): Observable<T> {
        return this.elasticService.getDocumentWithID(this.elasticType, id);
    }
    getWithFieldValueInType<T>(t:T, name: string, value: string): Observable<any> {
        return this.elasticService.getDocumentMatchingNameValue(t, name, value);
    }
    getElasticService() {
        return this.elasticService;
    }

}