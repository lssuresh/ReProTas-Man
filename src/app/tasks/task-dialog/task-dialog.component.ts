import { Component, OnInit, Injectable, Input, EventEmitter, Output } from '@angular/core';
import { TasksService } from '../tasks.service';
import { MsgsComponent } from 'src/app/msgs/msgs.component';
import { CommonDataComponent } from 'src/app/common-data/common-data.component';
import { Project } from 'src/app/projects/Project';
import { Developer } from 'src/app/developers/Developer';
import { TasksComponent } from '../tasks.component';
import { ProjectsService } from 'src/app/projects/projects.service';
import { DevelopersService } from 'src/app/developers/developers.service';
import { TaskUIData } from '../TaskUIData';
import { BaseComponent } from 'src/app/base-component';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.css']
})
@Injectable()
export class TaskDialogComponent extends BaseComponent implements OnInit {

  @Input() visible: boolean = false;
  @Output() displayChange = new EventEmitter();
  @Output() openDialog = new EventEmitter();
  @Output() dataChangeEvent = new EventEmitter();


  selectedTaskUIData: TaskUIData;
  addTask: boolean;

  selectedProject: Project;
  selectedDeveloper: Developer;

  projectDisplayList: any[];
  developerDisplayList: any[];

  errorMsgs = [];
  taskComponent: TasksComponent;

  constructor(
    private msgsComponent: MsgsComponent,
    private tasksService: TasksService, private commonDataComponent: CommonDataComponent) {
    super();
  }

  ngOnInit() {
    this.errorMsgs = [];
    this.addTask = false;
    this.selectedProject = new Project();
    this.selectedDeveloper = new Developer();
    this.selectedTaskUIData = new TaskUIData();
  }

  init(taskComponent: TasksComponent) {
    this.taskComponent = taskComponent;
    this.createDeveloperList();
    this.createProjectsList();
  }

  createDeveloperList() {
    this.developerDisplayList = [{ label: '', value: '' }];
    this.taskComponent.developers.forEach(item => this.developerDisplayList.push({ label: item.name, value: item.id }))
  }
  createProjectsList() {
    this.projectDisplayList = [{ label: '', value: '' }];
    this.taskComponent.projects.forEach(item => this.projectDisplayList.push({ label: item.name, value: item.id }))
  }

  setSelectProject(projectCode) {
    //var projectCode = event.value.code;
    if (projectCode) {
      var task = this.selectedTaskUIData.task;
      var projects = this.taskComponent.projects.filter(item => item.id == projectCode);
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
      var developerList = this.taskComponent.developers.filter(item => item.id == devCode);
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
    this.visible = false;
  }

  save() {
    if (this.selectedTaskUIData && this.selectedTaskUIData.task.name == null || this.selectedTaskUIData.task.developer == null) {
      //this.msgsComponent.showError('Please ener value for name and developer');
      this.errorMsgs.push({ severity: 'error', summary: 'Error Message', detail: 'Please ener value for name.' });
      return;
    }

    let Tasks = [...this.taskComponent.tasks];
    if (this.addTask) {
      this.tasksService.addTask(this.selectedTaskUIData.task).subscribe(
        data => {
          console.log(data);
          this.msgsComponent.showInfo('Task data Saved!');
          this.taskComponent.tasks.push(this.selectedTaskUIData.task);
        }
      );
    } else {
      this.tasksService.updateTask(this.selectedTaskUIData.task).subscribe(
        data => {
          console.log(data);
          this.msgsComponent.showInfo('Task Updated!');
        });

    }
    console.log("Updated ID" + this.selectedTaskUIData.task.id);
    this.addTask = null;
    this.visible = false;
    this.dataChangeEvent.emit(this.selectedTaskUIData.task);
  }


  onClose() {
    this.visible = false;
    this.addTask = false;
    this.displayChange.emit(false);
  }
  onOpen() {
    this.openDialog.emit(this);
  }
  showAddDialog() {
    this.addTask = true;
  }
  hideDialog() {
    this.visible = false;
  }


}
