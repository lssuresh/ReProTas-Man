import { Component, OnInit, ViewChild } from '@angular/core';

import { CommonDataComponent } from '../common-data/common-data.component';
import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from './tasks.service';
import { Task } from './task';
import { timer, BehaviorSubject } from 'rxjs';
import { Project } from '../projects/Project'
import { Developer } from '../developers/Developer';
import { ProjectsService } from '../projects/projects.service';
import { DevelopersService } from '../developers/developers.service';
import { TaskUIData } from './TaskUIData';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-web-storage';
import { LocalStorageLabel } from '../LocalStorageLabel';
import { DevHelper } from '../developers/DevHelper';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  DEFAULT_DISPLAY_VAL = "#NAV"
  tasks: Task[];
  tasksUIData: TaskUIData[];
  selectedTaskUIData: TaskUIData;
  displayDialog: boolean;

  selectedProject: Project;
  selectedDeveloper: Developer;

  projects: Project[];
  developers: Developer[];

  consumers = [];

  taskParamSubject;
  taskParam: string;
  releaseParam: string;
  developerParam: string;
  allTasks: boolean

  @ViewChild('taskDialog') taskDialog: TaskDialogComponent;


  columnsToDisplay: any[] = [
    { field: 'developerName', header: 'Developer' },
    { field: 'task.name', header: 'Name' },
    { field: 'task.application', header: 'Application' },
    { field: 'projectName', header: 'Project' },
    { field: 'task.start_date', header: 'Start Date' },
    { field: 'task.end_date', header: 'End Date' },
    // { field: 'QA_DATE', header: 'QA Date' },
    // { field: 'UAT_DATE', header: 'UAT Date' },
    // { field: 'PROD_DATE', header: 'Prod Date' },
    { field: 'task.release', header: 'Release' },
    { field: 'task.status', header: 'Status' },
    { field: 'task.comments', header: 'Comments' },
    { field: 'task.send_reminder', header: 'Send Reminder' }
  ];


  constructor(private route: ActivatedRoute, private tasksService: TasksService,
    private msgsComponent: MsgsComponent,
    private commonDataComponent: CommonDataComponent,
    private projectService: ProjectsService,
    private developersService: DevelopersService, private localStorage: LocalStorageService) {

    this.developerParam = localStorage.get(LocalStorageLabel.USER);
    this.route.queryParams.subscribe(params => {
      this.releaseParam = params['releaseNode'];
      if (params['task'] && this.taskParam != params['task']) {
        this.taskParam = params['task'];
        this.refreshTasks();
      }

    });

    this.developers = [];
    this.projects = [];
    this.tasks = [];
    this.loadProjects();
    this.loadDevelopers();
    this.refreshTasks();
    this.commonDataComponent.refreshCommonData();
    this.reset(null);
  }

  ngOnInit() {
    console.log("test");
  }

  loadProjects() {
    this.projectService.getOpenProjects().subscribe(data => {
      this.projects = data;
      this.buildUIProjectData();
    });
  }
  loadDevelopers() {
    this.developersService.getActiveDevelopers().subscribe(data => {
      this.developers = data;
      this.buildUIDevData();
    });
  }
  loadTasks() {
    if (this.developerParam && this.taskParam != "All") {
      if (this.developers && this.developers.length > 0) {
        var dev = this.developers.filter(item => item.userId == this.developerParam);
        if (dev && dev.length > 0) {
          this.tasksService.getTasksForDev(dev[0].id).subscribe(tasks => this.displayTasks(tasks));
        } else {
          this.msgsComponent.showError("Invalid dev name");
        }
      } else {
        this.developersService.getDeveloperWithName(this.developerParam).subscribe(developer => {
          if (developer) {
            this.tasksService.getTasksForDev(developer[0].id).subscribe(tasks => this.displayTasks(tasks));
          }
        });
      }
    } else {
      this.tasksService.loadTasks().subscribe(tasks => this.displayTasks(tasks));
    }
  }
  displayTasks(tasks: Task[]) {
    console.log("Retrieved Tasks ===>" + tasks);
    tasks.sort((a, b) => {
      if (a.name < b.name) return -1;
      else if (a.name > b.name) return 1;
      else return 0;
    });
    this.tasks = tasks;
    this.buildUITaskData();
    this.buildUIDevData();
    this.buildUIProjectData();
    this.setSelectedTaskUIData()
    this.consumers.forEach(item => item.consume(Task, this.tasks));
  }
  setSelectedTaskUIData() {
    if (this.taskParam) {
      var filteredItems = this.tasksUIData.filter(item => item.task.name == this.taskParam);
      if (filteredItems && filteredItems.length > 0) {
        this.selectedTaskUIData = filteredItems[0];
      }
    }
  }
  refreshWithTimer() {
    let source = timer(1000);
    source.subscribe(t => {
      this.refreshTasks();
    });
  }

  refreshTasks() {
    this.tasks = [];
    this.loadTasks();
    this.msgsComponent.showInfo('Task list refreshed');
    if (this.tasks.length > 0) {
      this.selectedTaskUIData = this.tasksUIData[0];
    }
  }

  editTask() {
    if (this.selectedTaskUIData) {
      this.taskDialog.taskComponent = this;
      this.taskDialog.selectedTaskUIData = this.selectedTaskUIData;
      this.setSelectProject(this.selectedTaskUIData.task.project);
      this.setSelectDeveloper(this.selectedTaskUIData.task.developer);
      this.taskDialog.createDeveloperList();
      this.taskDialog.createDeveloperList();
      this.displayDialog = true;
    }
  }

  setSelectProject(projectCode) {
    //var projectCode = event.value.code;
    if (projectCode) {
      var task = this.selectedTaskUIData.task;
      var projects = this.projects.filter(item => item.id == projectCode);
      if (projects.length > 0) {
        this.selectedProject = projects[0];
        task.project = this.selectedProject.id;
      }
    }
  }

  setSelectDeveloper(devId) {
    //var projectCode = event.value.code; 
    if (devId) {
      var task = this.selectedTaskUIData.task;
      this.selectedDeveloper = DevHelper.getDeveloperWithID(devId, this.developers);
      if (this.selectedDeveloper) {
        task.developer = this.selectedDeveloper.id;
      }
    }
  }


  reset(event: Event) {
    this.selectedTaskUIData = null;
    this.selectedProject = new Project();
    this.selectedDeveloper = new Developer();
  }
  isDate(val): boolean {
    return val instanceof Date;
  }

  buildUITaskData() {
    if (this.tasks && this.tasks.length > 0) {
      this.tasksUIData = [];
      var index = 0;
      var _this = this;
      _this.tasks.forEach(item => {
        _this.tasksUIData[index] = new TaskUIData();
        _this.tasksUIData[index].task = item;
        index++;
      });
    }
  }

  buildUIDevData() {
    if (this.tasks && this.tasks.length > 0 && this.developers) {
      var _this = this;
      var index = 0;
      _this.tasks.forEach(item => {
        var selectedDev = _this.developers.filter(devItem => devItem.id == item.developer);
        _this.tasksUIData[index].developerName = selectedDev && selectedDev.length > 0 ? selectedDev[0].name : _this.DEFAULT_DISPLAY_VAL
        index++;
      });
    }
  }

  buildUIProjectData() {
    if (this.tasks && this.tasks.length > 0 && this.projects) {
      var index = 0;
      var _this = this;
      this.tasks.forEach(item => {
        var selProj = _this.projects.filter(projItem => projItem.id == item.project);
        _this.tasksUIData[index].projectName = selProj && selProj.length > 0 ? selProj[0].name : _this.DEFAULT_DISPLAY_VAL
        index++;
      });
    }
  }
  setTaskDialog(taskDialog: TaskDialogComponent) {
    this.taskDialog = taskDialog;
  }

  showAddDialog() {
    this.taskDialog.init(this);
    this.displayDialog = true;
    this.taskDialog.selectedTaskUIData = new TaskUIData();
    if (this.developerParam) {
      this.taskDialog.selectedTaskUIData.task.developer = DevHelper.getDevIdForUserName(this.developerParam, this.developers);;
    }
    this.taskDialog.showAddDialog();
  }


  showAddDialogWithDateAndDev(start_date: Date, dev: string) {
    this.taskDialog.init(this);
    this.displayDialog = true;
    this.taskDialog.selectedTaskUIData = new TaskUIData();
    this.taskDialog.selectedTaskUIData.task.start_date = start_date;
    this.taskDialog.selectedTaskUIData.task.developer = dev;
    this.taskDialog.showAddDialog();
  }

  hideDialog(event) {
    this.displayDialog = event;
  }
  initDialog(event) {
    console.log(event);
  }

  delete() {
    this.tasksService.deleteTask(this.selectedTaskUIData.task).subscribe(
      data => {
        console.log("Deleted Successfully!");
        this.tasks = this.tasks.filter(task => task.name != this.selectedTaskUIData.task.name);
        this.tasksUIData = this.tasksUIData.filter(taskUI => taskUI.task.name == this.selectedTaskUIData.task.name);
        this.refreshWithTimer();
        this.msgsComponent.showInfo('Task Deleted!');
      });
  }

  dialogDataChanged(event) {
    if (!event.id) {
      this.tasks.push(event);
      var taskUIData = new TaskUIData();
      taskUIData.task = event;
      taskUIData.projectName = '';
      taskUIData.developerName = '';
      this.tasksUIData.push(taskUIData);
    } else {
      var updatedTask = this.tasks.filter(item => item.id == event.id);
      if (updatedTask && updatedTask.length > 0) {
        updatedTask[0] = event;
      }
    }
    this.refreshWithTimer();
  }
}