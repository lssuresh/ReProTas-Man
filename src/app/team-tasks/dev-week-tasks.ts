import { Base } from '../Base';
import { Task } from '../tasks/task';

export class DevWeekTasks {

    devName: string;
    weekTask: Map<string, Task[]> = new Map<string, Task[]>();
    maxTasks: number;

    maxTaskArrayPlaceHolder;

    static MAX_TASKS: number = 5;

    constructor(devName: string) {
        this.devName = devName;
        this.maxTasks = DevWeekTasks.MAX_TASKS;
    }

    addTaskForWeek(week: string, task: Task) {
        if (this.weekTask.has(week)) {
            this.weekTask.get(week).push(task);
        } else {
            this.weekTask.set(week, [task]);
        }
        this.calculateMaxTask();
    }
    removeWeekTask(week: string, task: Task) {
        if (this.weekTask.has(week)) {
            this.weekTask.set(week, this.weekTask.get(week).filter(item => item.id != task.id));
        }
        this.calculateMaxTask();
        return false;

    }

    calculateMaxTask() {
        this.maxTasks = DevWeekTasks.MAX_TASKS;
        for (let element in this.weekTask.values) {
            if (element.length > this.maxTasks) {
                this.maxTasks = element.length;
            }
        }

        this.maxTaskArrayPlaceHolder = Array(this.maxTasks).fill(1);
    }

}
