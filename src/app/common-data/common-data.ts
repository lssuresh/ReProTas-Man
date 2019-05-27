
import { SingleCommonData } from './single-common-data';
import {Base } from '../Base';

export class CommonData extends Base {
    id:string;

    elasticType = CommonData.name;

    dataList:SingleCommonData[];

    constructor() {
        super();
        this.dataList = [];
    }

    getDataList(): any[] {
        return this.dataList;
    }
    setDataList(dataList: SingleCommonData[]){
        this.dataList=dataList;
    }
    clearDataList(): any[]{
        this.dataList=[];
        return this.dataList;
    }
     
    getElasticType():string{
       return CommonData.name;
    }

    deserialize(id: string, input: any): this{         
        this.id = id;
        this.dataList = input.dataList.map(item =>{
            var instance = new SingleCommonData();
            instance.name=item.name;
            instance.value=item.value;            
            console.log("Singe item deserialzed "+instance);
            return instance;
        });
        return this;
    }
}