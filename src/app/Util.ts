import { Developer } from './developers/Developer';

export class Util {

    static isDate(val): boolean {
        return val instanceof Date;
    }

    static getDevNameForId(id: string, developers: Developer[]): string {
        var name = "";
        developers.forEach(item => {
            if (item.id == id) {
                name = item.name;
                return;
            }
        });
        return name;
    }
    static getDevForId(id: string, developers: Developer[]): Developer {
        var dev;
        developers.forEach(item => {
            if (item.id == id) {
                dev = item;
                return;
            }
        });
        return dev;
    }
    static getIdForDevName(name: string, developers: Developer[]): string {
        var id = "";
        developers.forEach(item => {
            if (item.name == name) {
                id = item.id;
                return;
            }
        });
        return id;
    }


}