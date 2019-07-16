import { TreeNode } from 'primeng/api';
import { Task } from '../tasks/task';
import { Project } from '../projects/Project';

export class ReProTasNode implements TreeNode {
    label: string;
    data: string;
    leaf: boolean;
    expandedIcon = 'pi pi-folder-open';
    collapsedIcon = 'pi pi-folder';
    children: ReProTasNode[];
    expanded: boolean;
    icon = '';
    type: string;
    task: Task;
    project: Project;


    constructor(label, data, leaf) {
        this.label = label;
        this.data = data;
        this.leaf = leaf;
        this.children = [];
        this.expanded = false;

        if (this.leaf) {
            this.icon = 'pi pi-file';
        }
    }

    addChild(node: ReProTasNode) {
        this.children.push(node);
    }

    removeChild(node: ReProTasNode) {
        this.children = this.children.filter(item => item.data != node.data);
    }
    clearChildren() {
        this.children = [];
    }



}
