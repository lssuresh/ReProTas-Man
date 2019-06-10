import { FilterMetadata } from 'primeng/api';

export class ElasticQuery {

    match_not: string[];
    match: string[];
    filter: string[];
    rangeFilter: string[];

    private MATCH_VALUE_KEY = '$$MATCH$$';
    private NOT_MATCH_VALUE_KEY = '$$NOT_MATCH$$';
    private QUERY_VALUE = '$$FILTER$$';


    constructor() {
        this.match = [];
        this.filter = [];
        this.rangeFilter = [];
        this.match_not = [];
    }


    search_query = `{
            "query": { 
                "bool": {` +
        this.MATCH_VALUE_KEY +
        this.NOT_MATCH_VALUE_KEY +
        this.QUERY_VALUE +
        `}
         }
        }`;

    createORValues(valueArr: string[]) {
        var returnVal = "";
        valueArr.forEach(value => {
            if (returnVal.length == 0)
                returnVal = value;
            else
                returnVal = returnVal + " | " + value + ",";

        });
        returnVal = "(" + returnVal + ")";
        return returnVal;
    }
    addFilter(name, value) {
        this.filter.push('{ "term": { "' + name + '": "' + value + '" } }');
    }
    addRangeFilter(name: string, startDate: Date, endDate: Date) {
        this.match.push('{"range": { "' + name + '": {' +
            '"from": "' + startDate.toJSON() + '",' +
            '"to": "' + endDate.toJSON() + '"' +
            '}' +
            ' } ' +
            '}');
    }
    addRangeFilterGT(startField: string, startDate: Date) {
        this.match.push('{"range": { "' + startField + '": {' +
            '"gte": "' + startDate.toJSON() +
            '}' +
            ' } ' +
            '}');
    }
    addRangeFilterLT(endField: string, endDate: Date) {
        this.match.push('{"range": { "' + endField + '": {' +
            '"lte": "' + endDate.toJSON() +
            '}' +
            ' } ' +
            '}');

    }

    createMatch() {
        return '"must": [' + this.match.toString() + ']';
    }
    createNotMatch() {
        //we check if any values have been added then we add comma
        if (this.match.length > 0)
            return ',"must_not": [' + this.match_not.toString() + ']';
        else
            return '"must_not": [' + this.match_not.toString() + ']';
    }

    createFilter() {
        //we check if any values have been added then we add comma
        if (this.match.length > 0 || this.match_not.length > 0)
            return ', "filter": [' + this.filter.toString() + ']';
        else
            return '"filter": [' + this.filter.toString() + ']';
    }

    addSearchField(name, value) {
        this.match.push('{ "match": { "' + name + '": "' + value + '" }}');
    }
    addSearchFieldWithValues(name, valueArr: string[]) {
        this.match.push('{ "match": { "' + name + '": "' + this.createORValues(valueArr) + '" }}');
    }
    addSearchValueNotIn(name, value) {
        this.match_not.push('{ "match": { "' + name + '": "' + value + '" }}');
    }

    addSearchValuesNotIn(name, valueArr: string[]) {
        this.match_not.push('{ "match": { "' + name + '": "' + this.createORValues(valueArr) + '" }}');
    }

    createQuery() {
        var query = this.search_query;
        if (this.match && this.match.length > 0) {
            query = query.replace(this.MATCH_VALUE_KEY, this.createMatch());
        }
        if (this.match_not && this.match_not.length > 0) {
            query = query.replace(this.NOT_MATCH_VALUE_KEY, this.createNotMatch());
        } else {
            query = query.replace(this.NOT_MATCH_VALUE_KEY, '');
        }
        if (this.filter.length > 0) {
            query = query.replace(this.QUERY_VALUE, this.filter.toString());
        } else {
            query = query.replace(this.QUERY_VALUE, '');
        }
        console.log("Build Query=>" + query);
        return query;
    }

}