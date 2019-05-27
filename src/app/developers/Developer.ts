import { Base } from '../Base';

export class Developer extends Base {

  id: string;
  name: string;
  phone: string;
  mobile: string;
  email: string;
  workHours: string;
  status: string;
 
  constructor() {
    super();
  }

  deserialize(_id: string, input: any): this {
    Object.assign(this, input);
    this.id = _id; 
   return this;
  }

  getElasticType(): string {
    return Developer.name;
  }

}