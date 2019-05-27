import { Base } from '../Base';

export class Task extends Base {
    name:string;
    application:string;
    developer:string;
    project:string;
    start_date: Date;
    end_date: Date;
    QA_date: Date;
    UAT_date: Date;
    PROD_date: Date;
    send_reminder:string;

}


