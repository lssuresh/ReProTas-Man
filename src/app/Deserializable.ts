export interface Deserializable {
    deserialize(id: string, input: any): this;    
    setElasticType(elasticType: string);
    getElasticType(): string;
  }