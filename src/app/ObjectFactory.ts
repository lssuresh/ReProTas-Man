import { Deserializable } from './Deserializable';

export class ObjectFactory {
  static createInstance<T extends Deserializable>(type: { new(): T; }): T {
    return new type();
  }

  static createNewTypeFrom<T extends Deserializable>(p: any, type: { new(): T; }): T {
    var t = new type();
    t = Object.assign(t, p.value);
    t.setElasticType(t.getElasticType());
    return t;
  }
}