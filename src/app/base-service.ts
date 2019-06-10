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
    getWithFieldValueInType<T>(t: T, name: string, valueArr: string[]): Observable<any> {
        return this.elasticService.matchValue(t, name, valueArr);
    }

    getWithFieldValueNotInType<T>(t: T, name: string, valueArr: string[]): Observable<any> {
        return this.elasticService.matchNotInValue(t, name, valueArr);
    }
    getElasticService() {
        return this.elasticService;
    }

}