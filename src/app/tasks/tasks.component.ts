import { Component, OnInit } from '@angular/core';

import { CommonDataComponent } from '../common-data/common-data.component';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';


import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from './tasks.service';
import { Task } from './task';
import { timer } from 'rxjs';
import { ObjectFactory } from '../ObjectFactory';
import { ProjectsComponent } from '../projects/projects.component';
import { Project } from '../projects/Project'
import { Developer } from '../developers/Developer';

import { ProjectsService } from '../projects/projects.service';
import { DevelopersService } from '../developers/developers.service';
import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { TaskUIData } from './TaskUIData';
import { DateFormatPipe } from '../DatePipe';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  DEFAULT_DISPLAY_VAL = "#NAV"
  tasks: Task[];
  tasksUIData: TaskUIData[];
  rowGroupMetaData: any;
  selectedTaskUIData: TaskUIData;
  displayDialog: boolean;
  addTask: boolean;

  selectedProject: Project;
  selectedDeveloper: Developer;

  projects: Project[];
  developers: Developer[];

  projectDisplayList: any[];
  developerDisplayList: any[];

  progressValue: number;

  errorMsgs = [];

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
    { field: 'task.status', header: 'Status' },
    { field: 'task.comments', header: 'Comments' },
    { field: 'task.send_reminder', header: 'Send Reminder' }
  ];


  constructor(private tasksService: TasksService,
    private msgsComponent: MsgsComponent,
    private commonDataComponent: CommonDataComponent,
    private projectService: ProjectsService,
    private developersService: DevelopersService
  ) {
  }

  ngOnInit() {
    this.developersService.getActiveDevelopers().subscribe(data => this.createDeveloperList(data));
    this.projectService.getOpenProjects().subscribe(data => this.createProjectsList(data));
    this.refreshTasks();
    this.commonDataComponent.refreshCommonData();
    this.reset(null);
  }

  refreshWithTimer() {
    let source = timer(1000);
    source.subscribe(t => {
      this.refreshTasks();
    });
  }

  refreshTasks() {
    this.tasks = [];
    this.tasksService.loadTasks().subscribe(tasks => {
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
      this.msgsComponent.showInfo('Task list refreshed');
      if (tasks.length > 0) {
        this.selectedTaskUIData = this.tasksUIData[0];
      }
      this.progressValue = 30;
    });
  }

  showAddDialog() {
    this.errorMsgs = [];
    this.addTask = true;
    this.selectedTaskUIData = new TaskUIData();
    this.displayDialog = true;
  }
  save() {
    if (this.selectedTaskUIData && this.selectedTaskUIData.task.name == null || this.selectedTaskUIData.task.developer == null) {
      //this.msgsComponent.showError('Please ener value for name and developer');
      this.errorMsgs.push({ severity: 'error', summary: 'Error Message', detail: 'Please ener value for name.' });
      return;
    }

    let Tasks = [...this.tasks];
    if (this.addTask) {
      this.tasksService.addTask(this.selectedTaskUIData.task).subscribe(
        data => {
          console.log(data);
          this.tasks.push(this.selectedTaskUIData.task);
          this.buildUIProjectData();
          this.buildUIDevData();
          this.msgsComponent.showInfo('Task data Saved!');
        }
      );
    } else {
      this.tasksService.updateTask(this.selectedTaskUIData.task).subscribe(
        data => {
          console.log(data);
          this.msgsComponent.showInfo('Task Updated!');
        });

    }
    this.refreshWithTimer();
    console.log("Updated ID" + this.selectedTaskUIData.task.id);
    this.addTask = null;
    this.displayDialog = false;
  }

  delete() {
    this.tasksService.deleteTask(this.selectedTaskUIData.task).subscribe(
      data => {
        console.log("Deleted Successfully!");
        this.tasks = this.tasks.filter(dev => dev.name != this.selectedTaskUIData.task.name);
        this.refreshWithTimer();
        this.msgsComponent.showInfo('Task Deleted!');
      });
  }

  onRowSelect() {
    if (this.selectedTaskUIData) {
      this.addTask = false;
      this.displayDialog = true;
      this.setSelectProject(this.selectedTaskUIData.task.project);
      this.setSelectDeveloper(this.selectedTaskUIData.task.developer);
    }
  }

  createDeveloperList(data: Developer[]) {
    this.developerDisplayList = [];
    this.developers = data;
    this.developers.forEach(item => this.developerDisplayList.push({ label: item.name, value: item.id }))
    this.buildUIDevData();


  }
  createProjectsList(data: Project[]) {
    this.projectDisplayList = [];
    this.projects = data;
    this.projects.forEach(item => this.projectDisplayList.push({ label: item.name, value: item.id }))
    this.buildUIProjectData();

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

  setSelectDeveloper(devCode) {
    //var projectCode = event.value.code; 
    if (devCode) {
      var task = this.selectedTaskUIData.task;
      var developerList = this.developers.filter(item => item.id == devCode);
      if (developerList.length > 0) {
        this.selectedDeveloper = developerList[0];
        task.developer = this.selectedDeveloper.id;
      }
    }
  }

  reset(event: Event) {
    this.selectedTaskUIData = null;
    this.addTask = null;
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

}
