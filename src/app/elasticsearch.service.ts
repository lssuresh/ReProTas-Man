import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from 'elasticsearch-browser'
import { environment } from '../environments/environment';
import { Globals } from './config/globals';
import { Observable, of, from, Subscriber, observable } from 'rxjs';
import { Deserializable } from './Deserializable';
import { ObjectFactory } from './ObjectFactory';

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {

  private client: Client;

  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) {
    this.connect();
  }

  connect() {
    this.client = new Client({
      host: environment.elastic_url,
      log: 'trace'
    });
  }

  private queryalldocs = {
    'query': {
      'match_all': {}
    }
  };

  ping(): string {
    return this.client.ping({
      requestTimeout: Infinity,
      body: 'hello JavaSampleApproach!'
    });
  }

  getAllDocuments(_type, instanceType): Observable<any> {
    var outerObserver;
    this.http.get(this.getURLWithURI('/_search?q=elasticType:' + _type + '&filter_path=hits.hits')).subscribe(response => {
      console.log(JSON.stringify(response));
      if (response && response['hits'] && response['hits']['hits']) {
        outerObserver.next(response['hits']['hits'].map(item => ObjectFactory.createInstance(instanceType).deserialize(item._id,
          item._source)));
        outerObserver.complete();
      } else {
        console.log("Could not retrieve data for call type " + _type);
        outerObserver.complete();
      }
    });


    // this.client.search({
    //   index: Globals.elasticIndex,
    //   type: _type,
    //   body: this.queryalldocs,
    //   filterPath: ['hits.hits']
    // }).then(response => {
    //   if (response && response.hits && response.hits.hits) {
    //     outerObserver.next(response.hits.hits.map(item => ObjectFactory.createInstance(instanceType).deserialize(item._id,
    //       item._source)));
    //     outerObserver.complete();
    //   }
    // }, error => {
    //   console.error(error);
    // }).then(() => {
    //   console.log('Show Customer Completed!');
    // });

    return Observable.create((observer: Subscriber<any>) => {
      outerObserver = observer;
    });
  }

  // We want to use it without index so we use http
  addDocument(value): Observable<any> {
    if (value) {
      return this.http.post(this.getURL(), value, this.httpOptions);

    } else {
      console.log("Type or value is null. Val =" + value);
    }
  }


  updateDocument(value): Observable<any> {
    if (value) {
      return this.http.post(this.getURL() + '/' + value.id, value, this.httpOptions);
    } else {
      console.log("Value is null. Val =" + value);
    }
  }
  deleteDocument(value): Observable<any> {
    if (value) {
      return this.http.delete(this.getURL() + '/' + value.id);
    } else {
      console.log("Value is null. Val =" + value);
    }
  }
  getURL() {
    return environment.elastic_url + Globals.elasticIndex + '/' + Globals.elasticType;
  }
  getURLWithURI(uri) {
    return this.getURL() + uri;
  }

}
