import { Component, OnInit, Type, ViewChild } from '@angular/core';

import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/task';
import { TasksComponent } from '../tasks/tasks.component';

import { DevelopersComponent } from '../developers/developers.component';

import * as moment from 'moment';
import { DevWeekTasks } from './dev-week-tasks';
import { Consumer } from '../consumer';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { TaskUIData } from '../tasks/TaskUIData';
import { Developer } from '../developers/Developer';
import { timer, Observable, forkJoin } from 'rxjs';
import { DevelopersService } from '../developers/developers.service';

@Component({
  selector: 'app-team-tasks',
  templateUrl: './team-tasks.component.html',
  styleUrls: ['./team-tasks.component.css']
})
export class TeamTasksComponent implements OnInit, Consumer {

  weekStartRange = 3;
  weekEndRange = 1;

  dateFormat = "MM/DD/YYYY";
  weekStart = "Monday";
  weekEnd = "Friday";
  startDateKey = 'start_date';
  endDateKey = 'end_date';
  firstColumnName = "Open";

  selectedTaskId: string;
  teamDevWeekTasks: DevWeekTasks[];
  developers: Developer[];

  weeks: string[];
  weekDates: Map<string, any>;
  newTask: string;

  menuItems: MenuItem[];
  tasks: Task[];
  columnsToDisplay: any[];

  displayDialog: boolean;

  selectedDevName: string;
  selectedWeek: string;
  selectedTask: Task;

  constructor(private tasksService: TasksService,
    private msgsComponent: MsgsComponent, private tasksComponent: TasksComponent,
    private confirmationService: ConfirmationService, private developerService: DevelopersService) {
    //this.developerComponent.addConsumer(this);
    this.resetSessionData();
    //this.tasksComponent.refreshTasks();
    this.refreshViewData();
    this.buildMenu();
  }

  ngOnInit() {

  }

  buildMenu() {
    this.menuItems = [
      { label: 'New ', icon: 'pi pi-plus', command: (event) => this.showAddDialog() },
      { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.tasksComponent.displayDialog = true },
      { label: 'Delete', icon: 'pi pi-times', command: (event) => this.deleteTask() }
    ];
  }


  refreshViewData() {

    var observerables = [];

    //observerables[0] = this.tasksService.getOpenTasksBetweenDates(rangeStart, rangeEnd);
    observerables[0] = this.tasksService.getOpenTasks();
    observerables[1] = this.developerService.getActiveDevelopers();

    forkJoin(observerables).subscribe(tasksArr => {
      this.teamDevWeekTasks = [];
      this.tasks = [];

      if (tasksArr[0]) {
        this.tasks = this.tasks.concat(...tasksArr[0]);
      }
      if (tasksArr[3]) {
        this.tasks = this.tasks.concat(...tasksArr[1]);
      }
      if (tasksArr[1]) {
        this.developers = tasksArr[1];
        this.createBlankOpenTaskForAllDev();
      }

      var _this = this;

      if (this.tasks) {
        this.rebuildUI();
        this.refreshDevNames();
      }

      this.constructColumns();

    });
  }
  createBlankOpenTaskForAllDev() {
    //Create prime data, old task column for all developers     
    var tasks = [];
    this.developers.forEach(item => {
      var task = new Task();
      task.developer = item.name;
      tasks.push(task);
    });
  }
  rebuildUIForTasks(openTasks: Task[]) {
    openTasks.forEach(taskItem => {
      var devWeekTasks = this.getDevWeekTasks(taskItem.developer);
      if (devWeekTasks) {
        devWeekTasks.addTaskForWeek(this.firstColumnName, taskItem);
      } else {
        devWeekTasks = new DevWeekTasks(taskItem.developer);
        this.teamDevWeekTasks.push(devWeekTasks);
        devWeekTasks.addTaskForWeek(this.firstColumnName, taskItem);
      }
    });
  }

  getDevWeekTasks(developer: string): DevWeekTasks {
    var devWeekTasks = this.teamDevWeekTasks.filter(item => item.devName == developer);
    if (devWeekTasks && devWeekTasks.length > 0) {
      return devWeekTasks[0];
    }
  }

  resetSessionData() {
    this.weekDates = new Map<string, any>();
    this.columnsToDisplay = [{ field: 'devName', header: 'Developer' }, { field: this.firstColumnName, header: this.firstColumnName }];
    this.teamDevWeekTasks = [];
    this.weeks = [];
    this.selectedTask = new Task();
    this.selectedDevName = "";
    this.selectedTaskId = "";
    this.selectedWeek = "";
  }

  // re-lays out the tasks into matrix data by putting appropriate task in 
  // right index for developer
  rebuildUI() {
    this.resetSessionData();

    //subtract current date by weekstart range and find the weekStart Day and get date.
    let rangeStartMoment = moment().subtract(this.weekStartRange, 'w').day(this.weekStart);
    var rangeStart = rangeStartMoment.startOf('day');

    let rangeEndMoment = moment().add(this.weekEndRange, 'w').day(this.weekEnd);
    var rangeEnd = rangeEndMoment.endOf('day');

    this.tasks.forEach(taskItem => {
      var devWeekTasks = this.getDevWeekTasks(taskItem.developer);
      var weekLbl = this.firstColumnName;

      // we add ot the week label only if its within our range
      // else we show in common label as OPEN
      if (taskItem.start_date && moment(taskItem.start_date).isAfter(rangeStart)) {
        var weekNum = moment(taskItem.start_date).format('W');
        weekLbl = this.getWeekLabel(weekNum);
        this.weekDates.set(weekLbl, {
          [this.startDateKey]: moment().day(this.weekStart).week(+weekNum).toDate(),
          [this.endDateKey]: moment().day(this.weekEnd).week(+weekNum).toDate()
        });
      }

      this.weeks.indexOf(weekLbl) == -1 ? this.weeks.push(weekLbl) : console.log('Week index already present ' + weekLbl);
      if (devWeekTasks) {
        devWeekTasks.addTaskForWeek(weekLbl, taskItem);
      } else {
        devWeekTasks = new DevWeekTasks(taskItem.developer);
        this.teamDevWeekTasks.push(devWeekTasks);
        devWeekTasks.addTaskForWeek(weekLbl, taskItem);
      }
    });

  }

  constructColumns() {
    if (this.weeks) {
      this.weeks.sort();
      //this.columnsToDisplay.push({ field: this.firstColumnName, header: this.firstColumnName });
      this.weeks.forEach(item => {
        if (item != this.firstColumnName) {
          var startDate = moment(this.weekDates.get(item)[this.startDateKey]).format(this.dateFormat);
          var endDate = moment(this.weekDates.get(item)[this.endDateKey]).format(this.dateFormat);
          this.columnsToDisplay.push({ field: 'weekTask.get(' + item + ')', header: item + '  (' + startDate + ')' });
        }
      });
    }
  }
  getWeekLabel(weekNum: string) {
    return "Week" + weekNum;
  }
  getData(tasks: Task[], index: number) {
    if (tasks && tasks.length > index) {
      return tasks[index].name;
    } else {
      return " ";
    }
  }

  getDevName(devWeekTasks: DevWeekTasks) {
    if (devWeekTasks)
      return devWeekTasks.devName;
    else return "";
  }
  consume<Developer>(type: any, data: any[]) {
    if (type == Developer) {
      this.refreshDevNames();
    }
  }
  refreshDevNames() {
    this.teamDevWeekTasks.forEach(item => {
      var devname = this.getDevNameForId(item.devName);
      if (devname) {
        item.devName = devname;
      }
    });
  }

  getDevNameForId(id: string): string {
    var name = "";
    this.developers.forEach(item => {
      if (item.id == id) {
        name = item.name;
        return;
      }
    });
    return name;
  }


  saveTask(devName: string, week: string, taskIndex: number) {
    if (!this.newTask || this.newTask.trim().length == 0) {
      return;
    }

    var tasks = [];
    var task;
    var weekTasks;

    var devWeekTask = this.teamDevWeekTasks.filter(item => item.devName == devName);
    if (devWeekTask && devWeekTask.length > 0) {
      weekTasks = devWeekTask[0].weekTask;
      tasks = weekTasks.get(week);
    }

    if (!tasks) {
      tasks = [];
    }

    if (this.selectedTask) {
      task = this.selectedTask;
    } else {
      task = new Task();
      task.developer = this.getDevId(devName);
      task.start_date = moment(this.weekDates.get(week)[this.startDateKey]).toDate();
      tasks.push(task);
    }

    // no change in name so send it back
    if (task.name == this.newTask) {
      return;
    }
    task.name = this.newTask;
    weekTasks.set(week, tasks);
    this.newTask = '';
    this.tasksService.addOrUpdate(task).subscribe(item => {
      this.msgsComponent.showInfo('Task update/added' + item.name);
    });
  }


  editTask(devName: string, week: string, taskIndex: number) {
    this.selectedTaskId = '';
    this.newTask = '';
    this.setSelectedTask(devName, week, taskIndex);

    if (this.selectedTask) {
      this.newTask = this.selectedTask.name;
      this.selectedTaskId = this.selectedTask.id;
    }
  }

  onRowSelect(event, devName, week, taskIndex) {
    if (devName) {
      this.selectedDevName = devName;
    }
    if (week) {
      this.selectedWeek = week;
    }
    this.setSelectedTask(devName, week, taskIndex);

    if (this.selectedTask) {
      this.selectedTaskId = this.selectedTask.id;
    }
  }
  setSelectedTask(devName, week, taskIndex): any {
    this.selectedTask = null;
    var devWeekTask = this.teamDevWeekTasks.filter(item => item.devName == devName);
    if (devWeekTask && devWeekTask.length > 0) {
      var weekTasks = devWeekTask[0].weekTask;
      var tasks = weekTasks.get(week);
      if (tasks && tasks.length > taskIndex) {
        this.selectedTask = tasks[taskIndex];
      }
    }
  }

  // gets called when we show the TaskDialog
  // passes the dialog reference that gets passed to TaskComponent
  initDialog(event) {
    this.tasksComponent.setTaskDialog(event);
    if (this.selectedTask && this.selectedTask.id) {
      var taskUIData = new TaskUIData();
      taskUIData.task = this.selectedTask;
      this.tasksComponent.selectedTaskUIData = taskUIData;
      this.tasksComponent.editTask();
    } else {
      this.tasksComponent.showAddDialog();
    }
    console.log(event);
  }

  // Add dialog will send this when new task is added.
  dialogDataChanged(event) {
    if (!event.id) {
      this.tasks.push(event);
    }
    this.refreshWithTimer();
  }

  showAddDialog(): void {
    var taskUIData = new TaskUIData();
    this.tasksComponent.selectedTaskUIData = taskUIData;
    this.selectedTask = new Task();
    this.tasksComponent.displayDialog = true;
  }

  deleteTask() {
    if (!this.selectedTask) {
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete task <br>' + this.selectedTask.name + '?',
      accept: () => {
        this.tasksService.deleteTask(this.selectedTask).subscribe(item => {
          this.msgsComponent.showInfo('Task deleted ' + item.name);
          this.tasks = this.tasks.filter(item => item.name != this.selectedTask.name);
          this.refreshWithTimer();
        });
      }
    });
  }


  refreshWithTimer() {
    let source = timer(800);
    source.subscribe(t => {
      this.refreshViewData();
    });
  }

  getDevId(devName: string): string {
    var devWithName = this.developers.filter(item => item.name == devName);
    if (devWithName && devWithName.length > 0) {
      return devWithName[0].id;
    }
    return "";
  }

}

