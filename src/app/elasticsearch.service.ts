import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from 'elasticsearch-browser'
import { environment } from '../environments/environment';
import { Globals } from './config/globals';
import { Observable, of, from, Subscriber, observable } from 'rxjs';
import { Deserializable } from './Deserializable';
import { ObjectFactory } from './ObjectFactory';
import { ElasticQuery } from './elastic-query';
import { Base } from './Base';

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {

  private client: Client;

  DEFAULT_SIZE = 100;

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
    console.log("HTTP URL " + url);
    this.http.get(url).subscribe(response => this.processResponse(_type, response, subscriberRef));
    return observable;
  }

  postAndGetDocumentsAsArray(_type, url, body): Observable<any[]> {
    var subscriberRef = new Subscriber<any[]>();
    var observable = Observable.create((observer: Subscriber<any[]>) => {
      subscriberRef = observer;
    });
    console.log("HTTP POST " + url);
    console.log("BODY " + body);
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
    return this.getDocumentsAsArray(_type, this.getGetSearchURL() + '?q=elasticType:' + elasticType + '&filter_path=hits.hits&size=' + this.DEFAULT_SIZE);
  }
  getAllDocuments_OLD(_type, instanceType): Observable<any[]> {
    var outerObserver;
    this.http.get(this.getGetSearchURL() + '?q=elasticType:' + _type + '&filter_path=hits.hits').subscribe(response => {
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

  matchValue(_type: any, key: string, valueArr: string[]) {
    if (_type && key && valueArr) {
      var eq = new ElasticQuery();
      eq.addSearchFieldWithValues('elasticType', [_type.name]);
      eq.addSearchFieldWithValues(key, valueArr);

      return this.postAndGetDocumentsAsArray(_type, this.getPOSTSearchURL(), eq.createQuery());
    } else {
      console.log("Invalid Params Name: " + name);
    }
  }

  matchNotInValue(_type: any, name: string, valueArr: string[]): Observable<any> {
    if (_type && name && valueArr) {
      var eq = new ElasticQuery();
      eq.addSearchFieldWithValues('elasticType', [_type.name]);
      eq.addSearchValuesNotIn(name, valueArr);
      return this.postAndGetDocumentsAsArray(_type, this.getPOSTSearchURL(), eq.createQuery());
    } else {
      console.log("Invalid Params Name: " + name);
    }
  }

  matchNotInValueAndRange(_type: any, name: string, valueArr: string[], rangeField: string, rangeStart: Date, rangeEnd: Date): Observable<any[]> {
    if (_type && name && valueArr) {
      var eq = new ElasticQuery();
      eq.addSearchFieldWithValues('elasticType', [_type.name]);
      eq.addSearchValuesNotIn(name, valueArr);
      eq.addRangeFilter(rangeField, rangeStart, rangeEnd);
      return this.postAndGetDocumentsAsArray(_type, this.getPOSTSearchURL(), eq.createQuery());
    } else {
      console.log("Invalid Params Name: " + name);
    }
  }
  matchValueAndRange(_type: any, name: string, valueArr: string[], rangeField: string, rangeStart: Date, rangeEnd: Date) {
    if (_type && name && valueArr) {
      var eq = new ElasticQuery();
      eq.addSearchFieldWithValues('elasticType', [_type.name]);
      eq.addSearchFieldWithValues(name, valueArr);
      eq.addRangeFilter(rangeField, rangeStart, rangeEnd);
      return this.postAndGetDocumentsAsArray(_type, this.getPOSTSearchURL(), eq.createQuery());
    } else {
      console.log("Invalid Params Name: " + name);
    }
  }

  matchNotInValueAndDiffRange(_type: any, name: string, valueArr: string[], rangeStartField: string, rangeEndField: string,
    rangeStart: Date, rangeEnd: Date): Observable<any[]> {
    if (_type && name && valueArr) {
      var eq = new ElasticQuery();
      eq.addSearchFieldWithValues('elasticType', [_type.name]);
      eq.addSearchValuesNotIn(name, valueArr);
      eq.addRangeFilterGT(rangeStartField, rangeStart);
      eq.addRangeFilterLT(rangeEndField, rangeEnd);

      return this.postAndGetDocumentsAsArray(_type, this.getPOSTSearchURL(), eq.createQuery());
    } else {
      console.log("Invalid Params Name: " + name);
    }
  }


  // We want to use it without index so we use http
  addDocument(value: Base): Observable<any> {
    if (value) {
      return this.http.post(this.getURL(), value, this.httpOptions);
    } else {
      console.log("Type or value is null. Val =" + value);
    }
  }

  updateDocument(value: Base): Observable<any> {
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
  getPOSTSearchURL() {
    return this.getURLWithURI('/_search?size=' + this.DEFAULT_SIZE);
  }
  getGetSearchURL() {
    return this.getURLWithURI('/_search');
  }

}
