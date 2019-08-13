import { ElasticsearchService } from './elasticsearch.service';
import { Observable } from 'rxjs';
import { Base } from './Base';
import { LocalStorageLabel } from './LocalStorageLabel';
import { LocalStorageService } from 'angular-web-storage';

export class BaseService {
    DEFAULT_USER = 'unk';
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
    getUser() {
        var user = JSON.parse(localStorage.getItem(LocalStorageLabel.USER))._value;
        return user ? user : this.DEFAULT_USER;
    }
    setAuditData(base: Base) {
        base.updated_by = this.getUser();
        base.updated_date = new Date();
    }

}