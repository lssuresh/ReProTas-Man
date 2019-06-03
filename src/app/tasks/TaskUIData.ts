import { Task } from './task';

export class TaskUIData {
    task: Task;
    developerName: string;
    projectName: string;

    constructor() {
        this.task = new Task();
    }

}