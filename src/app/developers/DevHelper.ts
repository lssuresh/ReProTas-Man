import { Developer } from './Developer';

export class DevHelper {
    static getDeveloperWithID(devName: string, developers: Developer[]): Developer {
        var dev;
        developers.forEach(item => {
            if (item.name == devName) {
                dev = item;
                return;
            }
        });
        return dev;
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

    static getDevIdForUserName(name: string, developers: Developer[]): string {
        var id = "";
        developers.forEach(item => {
            if (item.userId == name) {
                id = item.id;
                return;
            }
        });
        return id;
    }
}