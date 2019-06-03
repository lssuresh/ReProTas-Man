import { FilterMetadata } from 'primeng/api';
import { start } from 'repl';

export class ElasticQuery {


    match: string[];
    filter: string[];

    private QUERY_KEY = '$$MACTH$$';
    private QUERY_VALUE = '$$FILTER$$';


    search_query = `{
            "query": { 
                "bool": { 
                "must": [`+
        this.QUERY_KEY
        + `],
                "filter": [ `+
        this.QUERY_VALUE
        + `]
                }
            }
            }`;


    addSearchField(name, value) {
        this.match.push('{ "match": { "' + name + '": "' + value + '" }}');
    }

    addSearchFieldWithVlaues(name, valueArr: string[]) {
        this.match.push('{ "match": { "' + name + '": "' + this.createORValues(valueArr) + '" }}');
    }
    createORValues(valueArr: string[]) {
        var returnVal = "(";
        valueArr.forEach(value => returnVal + " | " + value + ",");
        returnVal = returnVal + ")";
        return returnVal;
    }
    addFilter(name, value) {
        this.filter.push('{ "term": { "' + name + '": "' + value + '" } }');
    }
    addRangeFilter(name, startDate, endDate) {
        this.filter.push('{ "range": { "' + name + '": {"' +
            '"from": "' + startDate + '",' +
            '"to": "' + endDate + '"' +
            '}' +
            ' } ' +
            '}');
    }

    createQuery() {
        var query = this.search_query;
        if (this.match && this.match.length > 0) {
            query = this.search_query.replace(this.QUERY_KEY, this.match.toString);
        }
        if (this.filter.length > 0) {
            query = query.replace(this.QUERY_VALUE, this.filter.toString);
        }
        return query;

    }


}