import { Base } from '../Base';
import { Developer } from '../developers/Developer';
import { Project } from '../projects/Project';

export class Task extends Base {
    name: string;
    application: string;
    developer: string;
    project: string;
    start_date: Date;
    end_date: Date;
    // QA_DATE: Date;
    // UAT_DATE: Date;
    // PROD_DATE: Date;
    status: string;
    comments: string;
    send_reminder: string;

    constructor() {
        super(Task.name);
        this.elasticType = Task.name;
    }

    deserialize(_id: string, input: any): this {
        Object.assign(this, input);
        this.id = _id;
        this.start_date = new Date(input.start_date);
        this.end_date = new Date(input.end_date);
        // this.QA_DATE = new Date(input.QA_DATE);
        // this.UAT_DATE = new Date(input.UAT_DATE);
        // this.PROD_DATE = new Date(input.PROD_DATE);
        return this;
    }

}




