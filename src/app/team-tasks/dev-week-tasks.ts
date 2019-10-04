import { Base } from '../Base';
import { Task } from '../tasks/task';

export class DevWeekTasks {

    devName: string;
    weekTask: Map<string, Task[]> = new Map<string, Task[]>();

    static DEFAULT_MAX_TASKS: number = 5;

    // this is used to iterate in UI to paint max rows for this dev.
    maxTaskArrayPlaceHolder = Array(DevWeekTasks.DEFAULT_MAX_TASKS).fill(1);

    constructor(devName: string) {
        this.devName = devName;
    }

    addTaskForWeek(week: string, task: Task) {
        if (this.weekTask.has(week)) {
            this.weekTask.get(week).push(task);
        } else {
            this.weekTask.set(week, [task]);
        }
        this.reCalculateMaxTask(this.weekTask.get(week));
    }
    reCalculateMaxTask(tasks: Task[]) {
        if (this.maxTaskArrayPlaceHolder.length < tasks.length) {
            this.maxTaskArrayPlaceHolder = Array(tasks.length).fill(1);
        }
    }
    removeWeekTask(week: string, task: Task) {
        if (this.weekTask.has(week)) {
            this.weekTask.set(week, this.weekTask.get(week).filter(item => item.id != task.id));
            this.reCalculateMaxTask(this.weekTask.get(week));
            return true;
        }
        return false;
    }

    calculateMaxTask() {
        var maxTasks = DevWeekTasks.DEFAULT_MAX_TASKS;
        for (let element in this.weekTask.values()) {
            if (element.length > maxTasks) {
                var maxTasks = element.length;
            }
        }
        this.maxTaskArrayPlaceHolder = Array(maxTasks).fill(1);
    }

}
