import { TreeNode } from 'primeng/api';
import { Task } from '../tasks/task';
import { Project } from '../projects/Project';
import { ReProTasNode } from './ReProTasNode';

export class ReleaseItemUI implements TreeNode {
    type: string;
    pt_name: string;
    application: string;
    PM: string;
    developer: string;
    release: string;
    status: string;

    constructor(node: ReProTasNode) {
        this.type = node.task ? "TASK" : "PROJECT";
        this.pt_name = node.task ? node.task.name : node.project.name;
        this.application = node.task ? node.task.application : node.project.application;
        this.PM = node.project ? node.project.PM : '';
        this.status = node.task ? node.task.status : node.project.status;
        this.release = node.task ? node.task.release : node.project.release;
    }
}
