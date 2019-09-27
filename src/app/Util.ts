import { Developer } from './developers/Developer';
import { Task } from './tasks/task';

export class Util {
    static getDeveloperWithUserId(userId: string, developers: Developer[]): Developer {
        if (!developers) {
            return null;
        }
        var dev;
        developers.forEach(item => {
            if (item.userId == userId) {
                dev = item;
                return;
            }
        });
        return dev;
    }
    static isTaskCompleted(task: Task) {
        return task.status == "Completed" || task.status == "Closed";
    }

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