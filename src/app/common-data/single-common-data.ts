import { Base } from '../Base';
import { supportsWebAnimations } from '@angular/animations/browser/src/render/web_animations/web_animations_driver';

export class SingleCommonData extends Base {
    name: string;
    value: string[];

    elasticType = SingleCommonData.name; 


    getElasticType(): string {
        return SingleCommonData.name;
    }
}