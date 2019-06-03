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
  private static QUERY_KEY = '$KEY$';
  private static QUERY_VALUE = '$VALUE$';
  private static QUERY_OPERAND = '$OPERAND$';

  query_search = `{
  "query": { 
    "bool": { 
      "must": [
        { "match": { "title":   "Search"}}, 
        { "match": { "content": "Elasticsearch"}}  
      ],
      "filter": [ 
        { "term":  { "status": "published" }}, 
        { "range": { "publish_date": { "gte": "2015-01-01" }}} 
      ]
    }
  }
}`;

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

  getDocumentsAsArray(_type: any, url: string) {

    //capture the reference of subscriber to send notifications.
    var subscriberRef = new Subscriber<any[]>();
    var observable = Observable.create((observer: Subscriber<any[]>) => {
      subscriberRef = observer;
    });
    this.http.get(url).subscribe(response => this.processResponse(_type, response, subscriberRef));
    return observable;
  }

  postAndGetDocumentsAsArray(_type, url, body) {
    var subscriberRef = new Subscriber<any[]>();
    var observable = Observable.create((observer: Subscriber<any[]>) => {
      subscriberRef = observer;
    });

    this.http.post(url, body, this.httpOptions).subscribe(response => this.processResponse(_type, response, subscriberRef));
    return observable;
  }

  processResponse(_type, response, subscriber) {
    console.log(JSON.stringify(response));
    if (response && response['hits'] && response['hits']['hits'] && response['hits']['hits'].length > 0) {
      subscriber.next(response['hits']['hits'].map(item => ObjectFactory.createInstance(_type).deserialize(item._id,
        item._source)));
    } else if (response['hits']['hits'].length > 0) {
      console.log("No date found for call type " + _type.name);
    } else {
      console.log("Could not retrieve data for call type " + _type.name);
    }
    subscriber.complete();
  }

  createObserver(): any {
    //capture the reference of subscriber to send notifications.
    var subscriberRef = new Subscriber<any[]>();

    var observable = Observable.create((observer: Subscriber<any[]>) => {
      subscriberRef = observer;
    });

    return [subscriberRef, observable];
  }


  getAllDocuments(elasticType, _type): Observable<any[]> {
    return this.getDocumentsAsArray(_type, this.getSearchURL() + '?q=elasticType:' + elasticType + '&filter_path=hits.hits');
  }
  getAllDocuments_OLD(_type, instanceType): Observable<any[]> {
    var outerObserver;
    this.http.get(this.getSearchURL() + '?q=elasticType:' + _type + '&filter_path=hits.hits').subscribe(response => {
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

    return Observable.create((observer: Subscriber<any[]>) => {
      outerObserver = observer;
    });
  }


  getDocumentWithID(_type: string, id: string): Observable<any> {
    if (id) {
      return this.getDocumentsAsArray(_type, this.getURL() + '/' + id);
    } else {
      console.log("Identifier is null. ID =" + id);
    }
  }

  getDocumentMatchingNameValue(_type: any, key: string, valueArr: string[]) {
    if (_type && key && valueArr) {
      var value = this.createORValues(valueArr);
      return this.postAndGetDocumentsAsArray(_type, this.getSearchURL(), this.buildSimpleQuery(["elasticType", key], [_type.name, value]));
    } else {
      console.log("Invalid Params Name: " + name);
    }
  }

  createORValues(valueArr: string[]) {
    var returnVal = "(";
    valueArr.forEach(value => returnVal + " | " + value + ",");
    returnVal = returnVal + ")";
    return returnVal;
  }

  getDocumentNotMatchingNameValue(_type: any, name: string, valueArr: string[]): Observable<any> {
    if (_type && name && valueArr) {
      var value = this.createORValues(valueArr);
      return this.postAndGetDocumentsAsArray(_type, this.getSearchURL(), this.buildSimpleQuery(["elasticType", name], [_type.name, "-" + value]));
    } else {
      console.log("Invalid Params Name: " + name);
    }
  }

  getFieldValueNotInAndRange(_type: any, name: string, valueArr: string[], rangeStart: Date, rangeEnd: Date) {
    if (_type && name && valueArr) {
      var value = this.createORValues(valueArr);
      return this.postAndGetDocumentsAsArray(_type, this.getSearchURL(), this.buildSimpleQuery(["elasticType", name], [_type.name, "-" + value]));
    } else {
      console.log("Invalid Params Name: " + name);
    }
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
  getSearchURL() {
    return this.getURLWithURI('/_search');
  }
  private buildSimpleQuery(key: string[], value: string[]) {
    return this.query_search.replace(ElasticsearchService.QUERY_KEY, key.map(item => '"' + item + '"').toString())
      .replace(ElasticsearchService.QUERY_VALUE, value.map(item => ' ' + item).toString())
      .replace(ElasticsearchService.QUERY_OPERAND, 'and');
  }

}
