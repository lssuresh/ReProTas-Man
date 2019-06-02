import { Deserializable } from './Deserializable';
import { Cloneable } from './Cloneable';

export class Base implements Deserializable, Cloneable {
  id: string;
  elasticType: string;

  constructor(elasticType: string) {
    this.elasticType = elasticType;
  }

  getElasticType(): string {
    return this.elasticType;
  }
  setElasticType(elasticType: string) {
    this.elasticType = elasticType;
  }

  clone(): Base {
    return Object.assign(new Base(''), this);
  }


  deserialize(id: string, input: any): this {
    throw "Not Supported!";
  }
}
