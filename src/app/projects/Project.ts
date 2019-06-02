import { Base } from '../Base';

export class Project extends Base {

  id: string;
  name: string;
  desc: string;
  application: string;
  PM: string;
  QA_DATE: Date;
  UAT_DATE: Date;
  PROD_DATE: Date;
  status: string;
  release: string;

  constructor() {
    super(Project.name);
  }

  deserialize(_id: string, input: any): this {
    Object.assign(this, input);
    this.id = _id;
    this.QA_DATE = new Date(input.QA_DATE);
    this.UAT_DATE = new Date(input.UAT_DATE);
    this.PROD_DATE = new Date(input.PROD_DATE);
    return this;
  }
}