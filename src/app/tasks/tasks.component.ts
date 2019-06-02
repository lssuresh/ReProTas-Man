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

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  DEFAULT_DISPLAY_VAL = "#NAV"

  tasks: Task[];
  rowGroupMetaData: any;
  selectedTask: Task;
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
    { field: 'developer', header: 'Developer' },
    { field: 'name', header: 'Name' },
    { field: 'application', header: 'Application' },
    { field: 'project', header: 'Project' },
    { field: 'start_date', header: 'Start Date' },
    { field: 'end_date', header: 'End Date' },
    // { field: 'QA_DATE', header: 'QA Date' },
    // { field: 'UAT_DATE', header: 'UAT Date' },
    // { field: 'PROD_DATE', header: 'Prod Date' },
    { field: 'status', header: 'Status' },
    { field: 'comments', header: 'Comments' },
    { field: 'send_reminder', header: 'Send Reminder' }
  ];


  constructor(private pfb: FormBuilder,
    private tasksService: TasksService,
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
      this.msgsComponent.showInfo('Task list refreshed');
      if (tasks.length > 0) {
        this.selectedTask = this.tasks[0];
      }
      this.progressValue = 30;
    });
  }

  showAddDialog() {
    this.addTask = true;
    this.selectedTask = new Task();
    this.displayDialog = true;
  }
  save() {
    if (this.selectedTask && this.selectedTask.name == null || this.selectedTask.developer == null) {
      this.msgsComponent.showError('Please ener value for name and developer');
      //this.errorMsgs.push({ error: 'info', summary: 'Error Message', detail: 'Please ener value for name.' });
      return;
    }

    let Tasks = [...this.tasks];
    if (this.addTask) {
      this.tasksService.addTask(this.selectedTask).subscribe(
        data => {
          console.log(data);
          this.tasks.push(this.selectedTask);
          this.msgsComponent.showInfo('Task data Saved!');
        }
      );
    } else {
      this.tasksService.updateTask(this.selectedTask).subscribe(
        data => {
          console.log(data);
          this.msgsComponent.showInfo('Task Updated!');
        });

    }
    this.refreshWithTimer();
    console.log("Updated ID" + this.selectedTask.id);
    this.addTask = null;
    this.displayDialog = false;
  }

  delete() {
    this.tasksService.deleteTask(this.selectedTask).subscribe(
      data => {
        console.log("Deleted Successfully!");
        this.tasks = this.tasks.filter(dev => dev.name != this.selectedTask.name);
        this.refreshWithTimer();
        this.msgsComponent.showInfo('Task Deleted!');
      });
  }

  onRowSelect() {
    if (this.selectedTask) {
      this.addTask = false;
      this.displayDialog = true;
      this.setSelectProject(this.selectedTask.project);
      this.setSelectDeveloper(this.selectedTask.developer);
    }
  }

  createDeveloperList(data: Developer[]) {
    this.developerDisplayList = [];
    this.developers = data;
    this.developers.forEach(item => this.developerDisplayList.push({ label: item.name, value: item.id }))
  }
  createProjectsList(data: Project[]) {
    this.projectDisplayList = [];
    this.projects = data;
    this.projects.forEach(item => this.projectDisplayList.push({ label: item.name, value: item.id }))

  }

  setSelectProject(projectCode) {
    //var projectCode = event.value.code;
    if (projectCode) {
      var task = this.selectedTask;
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
      var task = this.selectedTask;
      var developerList = this.developers.filter(item => item.id == devCode);
      if (developerList.length > 0) {
        this.selectedDeveloper = developerList[0];
        task.developer = this.selectedDeveloper.id;
      }
    }
  }

  reset(event: Event) {
    this.selectedTask = null;
    this.addTask = null;
    this.selectedProject = new Project();
    this.selectedDeveloper = new Developer();
  }
  isDate(val): boolean {
    return val instanceof Date;
  }
  getTransformedValue(colName, colValue) {
    if (colValue && colValue instanceof Date && !isNaN(colValue.getDay())) {
      return colValue.getMonth() + '/' + colValue.getDay() + '/' + colValue.getFullYear();
    } else if (colName == 'developer') {
      var selectedDev = this.developers.filter(item => item.id == colValue);
      return selectedDev && selectedDev.length > 0 ? selectedDev[0].name : this.DEFAULT_DISPLAY_VAL;
    } else if (colName == 'project') {
      var selProj = this.projects.filter(item => item.id == colValue);
      return selProj && selProj.length > 0 ? selProj[0].name : this.DEFAULT_DISPLAY_VAL;
    }
    return colValue;
  }
}
