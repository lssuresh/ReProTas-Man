import { Component, OnInit } from '@angular/core';
import { TasksService } from '../tasks/tasks.service';
import { MsgsComponent } from '../msgs/msgs.component';
import { ProjectsService } from '../projects/projects.service';
import { CommonDataComponent } from '../common-data/common-data.component';
import { TreeNode, MenuItem } from 'primeng/api';
import { ReProTasNode } from './ReProTasNode';
import { Task } from '../tasks/task';
import { Project } from '../projects/Project';
import { Developer } from '../developers/Developer';
import { DevelopersService } from '../developers/developers.service';
import { TaskUIData } from '../tasks/TaskUIData';
import { ReleaseItemUI } from './ReleaseItemUI';
import { Router, ActivatedRoute } from '@angular/router';
import { ReplaceSource } from 'webpack-sources';

@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrls: ['./release.component.css']
})
export class ReleaseComponent implements OnInit {

  isExpanded: boolean;

  root: ReProTasNode[];
  selectedNode: ReProTasNode;
  releaseParam: string;

  APP_NAME = "misc";

  developers = new Map<string, string>();

  releaseItems: ReleaseItemUI[];
  menuItems: MenuItem[];

  selectedReleaseItemUI: ReleaseItemUI;

  taskColumnsToDisplay: any[] = [
    { field: 'type', header: 'Type' },
    { field: 'pt_name', header: 'Project/Task Name' },
    { field: 'application', header: 'Application' },
    { field: 'developer', header: 'Developer' },
    { field: 'release', header: 'Release' },
    { field: 'PM', header: 'Project Manager' },
    { field: 'status', header: 'Status' }
  ];

  constructor(private route: ActivatedRoute,
    private tasksService: TasksService,
    private msgsComponent: MsgsComponent,
    private commonDataComponent: CommonDataComponent,
    private projectService: ProjectsService,
    private developersService: DevelopersService,
    private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.releaseParam = params['release'];
    });

    this.isExpanded = false;
  }

  ngOnInit() {

    this.releaseItems = [];
    this.loadDevelopers();

    this.menuItems = [
      { label: 'Open', icon: 'pi pi-pencil', command: (event) => this.openReleaseItem() }
    ];

    this.root = [new ReProTasNode("All Releases", "Releases", false)];
    this.buildTree();

  }
  buildTree() {
    this.buildTaskNodes();
  }

  loadDevelopers() {
    this.developersService.getActiveDevelopers().subscribe(data => {
      data.forEach(item => {
        this.developers.set(item.id, item.name);
      });
    });
  }

  buildTaskNodes() {
    this.commonDataComponent.releases.itemList.forEach(element => {
      var releaseNode = new ReProTasNode(element.value, element.value, false);
      this.root[0].addChild(releaseNode);
      var applicationNodes = new Map<string, ReProTasNode>();
      this.commonDataComponent.applications.itemList.forEach(item => {
        applicationNodes.set(item.label, new ReProTasNode(item.label, item.label, false));
      });

      this.tasksService.getTasksForRelease(element.value).subscribe(tasks => { this.createTasksInTree(tasks, releaseNode, applicationNodes) });
      this.projectService.getProjectsForRelease(element.value).subscribe(projects => { this.createProjectsInTree(projects, releaseNode, applicationNodes) });
    });
  }
  getAppNodeName(name: string) {
    if (!name) {
      return this.APP_NAME;
    }
    return name;
  }
  createTasksInTree(tasks: Task[], releaseNode: ReProTasNode, applications: Map<string, ReProTasNode>) {
    tasks.forEach(item => {
      var appNodeName = this.getAppNodeName(item.application);
      var appNode = applications.get(appNodeName);
      if (!appNode) {
        appNode = new ReProTasNode(appNodeName, appNodeName, false);
        applications.set(appNodeName, appNode);
      }
      var taskNode = new ReProTasNode(item.name, item.name, true);
      taskNode.task = item;
      appNode.addChild(taskNode);

    });
    this.addApplicationsToRelease(applications, releaseNode);
    this.setSelectedNode(this.root[0]);
  }

  createProjectsInTree(projects: Project[], releaseNode: ReProTasNode, applications: Map<string, ReProTasNode>) {
    projects.forEach(project => {
      var appNodeName = this.getAppNodeName(project.application);
      var appNode = applications.get(appNodeName);
      if (!appNode) {
        appNode = new ReProTasNode(project.application, project.application, false);
        applications.set(project.application, appNode);
      }
      var projectNode = new ReProTasNode(project.name, project.name, true);
      projectNode.project = project;
      appNode.addChild(projectNode);

    });
    this.addApplicationsToRelease(applications, releaseNode);
    this.setSelectedNode(this.root[0]);
  }
  addApplicationsToRelease(applications: Map<string, ReProTasNode>, releaseNode: ReProTasNode) {
    applications.forEach((value: ReProTasNode, key: string) => {
      if (applications.get(key) && applications.get(key).children && applications.get(key).children.length > 0) {
        if (releaseNode.children && !this.childAlreadyExists(releaseNode, value.label)) {
          releaseNode.addChild(value);
        }
      }
    });
  }
  childAlreadyExists(releaseNode: ReProTasNode, childName: string) {
    return releaseNode.children.filter(item => item.label == childName).length > 0;
  }

  loadTables(node: ReProTasNode) {
    if (!node)
      return;

    this.releaseItems = [];
    var children = this.loadChildTables(node);
    this.releaseItems = this.releaseItems.concat(...children);
  }

  loadChildTables(node: ReProTasNode): ReleaseItemUI[] {
    let uiData = [];
    if (node.task) {
      var taskReleaseItem = this.createReleaseItemforTask(node);
      uiData.push(taskReleaseItem);
    } else if (node.project) {
      uiData.push(new ReleaseItemUI(node));
    } else if (node.children) {
      node.children.forEach(item => {
        var children = this.loadChildTables(item)
        uiData = uiData.concat(...children);
      });
    }
    return uiData;
  }
  createReleaseItemforTask(node: ReProTasNode) {
    var releaseItem = new ReleaseItemUI(node);
    releaseItem.developer = this.developers.get(node.task.developer);
    return releaseItem;
  }
  openReleaseItem() {
    if (this.selectedReleaseItemUI) {
      if (this.selectedReleaseItemUI.type == 'PROJECT') {
        this.router.navigate(['/', 'projects'], { queryParams: { project: this.selectedReleaseItemUI.pt_name, releaseNode: this.selectedNode.label } });
      } else {
        this.router.navigate(['/', 'tasks'], { queryParams: { task: this.selectedReleaseItemUI.pt_name, releaseNode: this.selectedNode.label } });
      }
    }
  }

  setSelectedNode(node: ReProTasNode): boolean {
    this.root[0].expanded = this.root[0].label != this.releaseParam;
    if (node && this.releaseParam) {
      if (node.label == this.releaseParam) {
        this.selectedNode = node;
        this.loadTables(this.selectedNode);
        return true;
      } else if (node.children) {
        node.children.forEach(item => {
          item.expanded = this.setSelectedNode(item);
          if (item.expanded) {
            // this will expand the parent as well
            node.expanded = item.expanded;
          }
        });
        // returning this will expand the tree all the way up to
        //root 
        return node.expanded;
      }

    }
    return false;
  }


}
