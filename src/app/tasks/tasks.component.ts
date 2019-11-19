
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonDataComponent } from '../common-data/common-data.component';
import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from './tasks.service';
import { Task } from './task';
import { timer, BehaviorSubject } from 'rxjs';
import { Project } from '../projects/Project'
import { Developer } from '../developers/Developer';
import { ProjectsService } from '../projects/projects.service';
import { TaskUIData } from './TaskUIData';
import { DevelopersService } from '../developers/developers.service';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { ActivatedRoute } from '@angular/router';

import { LocalStorageService, LocalStorage } from 'angular-web-storage';
import { LocalStorageLabel } from '../LocalStorageLabel';
import { DevHelper } from '../developers/DevHelper';
import { BaseComponent } from '../base-component';
import { Util } from '../Util';
import { Table } from 'primeng/components/table/table';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent extends BaseComponent implements OnInit {

  tasks: Task[];
  DEFAULT_DISPLAY_VAL = "#NAV"
  tasksUIData: TaskUIData[];
  selectedTaskUIData: TaskUIData;
  displayDialog: boolean;

  selectedProject: Project;
  selectedDeveloper: Developer;

  projects: Project[];
  developers: Developer[];

  consumers = [];

  menuItems: MenuItem[];

  taskParamSubject;
  taskParam: string;
  taskStatusParam: string;
  developerParam: string;
  projectParam: string;
  @LocalStorage() taskFilter: string;

  @ViewChild('taskDialog') taskDialog: TaskDialogComponent;
  @ViewChild('dt') dataTable: Table;


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
    super();
    this.developerParam = localStorage.get(LocalStorageLabel.USER);
    this.developers = [];
    this.projects = [];
    this.tasks = [];
    this.loadProjects();

    this.route.queryParams.subscribe(params => {
      this.taskParam = null;
      this.taskStatusParam = null;
      this.developerParam = null;
      this.projectParam = null;
      if (params['task'] && this.taskParam != params['task'] && params['task'].length > 0) {
        this.taskParam = params['task'];
      }
      if (params['status'] && this.taskStatusParam != params['status'] && params['status'].length > 0) {
        this.taskStatusParam = params['status'];
      }
      if (params['project'] && this.taskStatusParam != params['project'] && params['project'].length > 0) {
        this.projectParam = params['project'];
      }
      this.developerParam = localStorage.get(LocalStorageLabel.USER);

      this.refreshTasks();
      this.commonDataComponent.refreshCommonData();
      this.reset(null);
      this.buildMenu();

    });
  }

  buildMenu() {
    if (this.user) {
      this.menuItems = [
        { label: 'New ', icon: 'pi pi-plus', command: (event) => this.showAddDialog() },
        { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.editTask() },
        { label: 'Delete', icon: 'pi pi-times', command: (event) => this.deleteTask() }
      ];
    } else {
      this.menuItems = [];
    }
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
  loadTasks() {

    // All tasks takes preecedence
    if (this.taskParam && this.taskParam == "All") {  //No dev selected
      this.tasksService.loadTasks().subscribe(tasks => this.displayTasks(tasks));
    } else if (this.projectParam) {
      this.taskFilter = "";
      var filteredProjects = this.projects.filter(item => item.name == this.projectParam);
      if (filteredProjects && filteredProjects.length > 0) {
        this.tasksService.getTasksForProjectId(filteredProjects[0].id).subscribe(tasks => this.displayTasks(tasks));
      } else {
        this.msgsComponent.showError("Invalid project code " + this.projectParam);
      }         //IF a developer is selected load task only for that dev   
    } else if (this.developerParam) {
      if (this.taskStatusParam) {
        var developer = Util.getDeveloperWithUserId(this.developerParam, this.developers);
        if (developer) {
          this.tasksService.getTasksWithStatus(developer.id, this.taskStatusParam).subscribe(tasks => this.displayTasks(tasks));
        }
      } else {
        // If dev is selected and the task filter is set to ALL then display everything
        if (this.developers) {
          var developer = Util.getDeveloperWithUserId(this.developerParam, this.developers);
          this.tasksService.getTasksForDev(developer.id).subscribe(tasks => this.displayTasks(tasks));
        } else {  // developers is not refreshed to call service and get dev data
          this.developersService.getDeveloperWithUserId(this.developerParam).subscribe(developers => {
            if (developers && developers.length > 0) {
              this.tasksService.getTasksForDev(developers[0].id).subscribe(tasks => this.displayTasks(tasks));
            }
          });
        }
      }
    } else {
      this.tasksService.loadTasks().subscribe(tasks => this.displayTasks(tasks));
    }
  }


  displayTasks(tasks: Task[]) {
    if (!tasks) {
      return;
    }
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
    if (this.dataTable && this.taskFilter) {
      this.dataTable.filterGlobal(this.taskFilter, 'contains');
    }
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
    // we need to get dev before tasks as need to filter tasks for dev
    this.developersService.getActiveDevelopers().subscribe(data => {
      this.developers = data;
      this.loadTasks();
      this.buildUIDevData();
    });
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
      this.taskDialog.createProjectsList();
      this.displayDialog = true;
    }
  }

  setSelectProject(projectCode) {
    //var projectCode = event.value.code;
    if (projectCode) {
      var task = this.selectedTaskUIData.task;
      if (this.projects.length > 0) {
        var projects = this.projects.filter(item => item.id == projectCode);
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
    this.refreshTasks();
  }
  initDialog(event) {
    console.log(event);
  }

  deleteTask() {
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

  onRowSelect(event, id: string) {
    var filteredItems = this.tasksUIData.filter(item => item.task.id == id);
    if (filteredItems && filteredItems.length > 0) {
      this.selectedTaskUIData = filteredItems[0];
    }
  }
}