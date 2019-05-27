import { Deserializable } from './Deserializable' ;
import { Cloneable } from './Cloneable'; 

export class Base implements Deserializable, Cloneable{
    id:string;
    elasticType:string;

    constructor(){
      this.setElasticType(this.getElasticType());
    }
 
    clone(): Base {
        return Object.assign(new Base(), this);
      }
    
      setElasticType(elasticType){
        this.elasticType=elasticType;
      }
      getElasticType():string{
          return this.elasticType;
      } 
      deserialize(id: string, input: any): this{
        throw "Not Supported!";       
      }
}
