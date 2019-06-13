import { Component, OnInit, Type } from '@angular/core';

import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/task';
import { TasksComponent } from '../tasks/tasks.component';

import { DevelopersComponent } from '../developers/developers.component';

import * as moment from 'moment';
import { DevWeekTasks } from './dev-week-tasks';
import { Consumer } from '../consumer';
import { MenuItem } from 'primeng/api';

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

  selectedTaskId: string;
  teamDevWeekTasks: DevWeekTasks[];
  weeks: string[];
  weekDates: Map<string, any>;
  newTask: string;

  menuItems: MenuItem[];

  columnsToDisplay: any[] = [
    { field: 'devName', header: 'Developer' },
  ];

  constructor(private tasksService: TasksService, private developerComponent: DevelopersComponent,
    private msgsComponent: MsgsComponent, private tasksComponent: TasksComponent) {
    this.developerComponent.addConsumer(this);
    this.weekDates = new Map<string, any>();
  }

  ngOnInit() {
    this.weeks = [];
    //this.weekDates = [];
    this.teamDevWeekTasks = [];
    this.tasksComponent.refreshTasks();
    this.buildUIData();
    this.buildMenu();
  }
  buildMenu() {
    this.menuItems = [
      { label: 'Open Task' },
      { label: 'Update' },
      { label: 'Delete' }
    ];
  }

  buildUIData() {
    //subtract current date by weekstart range and find the weekStart Day and get date.
    let rangeStartMoment = moment().subtract(this.weekStartRange, 'w').day(this.weekStart);
    var rangeStart = rangeStartMoment.startOf('day').toDate();

    let rangeEndMoment = moment().add(this.weekEndRange, 'w').day(this.weekEnd);
    var rangeEnd = rangeEndMoment.toDate();

    this.tasksService.getOpenTasksBetweenDates(rangeStart, rangeEnd).subscribe(tasks => {
      this.teamDevWeekTasks = [];
      var _this = this;
      if (tasks) {
        var index = 0;
        tasks.forEach(taskItem => {
          var devWeekTasks = this.getDevWeekTasks(taskItem.developer);
          var weekNum = moment(taskItem.start_date).format('W');
          var weekLbl = this.getWeekLabel(weekNum);
          this.weekDates.set(weekLbl, {
            [_this.startDateKey]: moment().day(this.weekStart).week(+weekNum).toDate(),
            [_this.endDateKey]: moment().day(this.weekEnd).week(+weekNum).toDate()
          });

          this.weeks.indexOf(weekLbl) == -1 ? this.weeks.push(weekLbl) : console.log('Week index already present ' + weekLbl);
          if (devWeekTasks) {
            devWeekTasks.addTaskForWeek(weekLbl, taskItem);
          } else {
            devWeekTasks = new DevWeekTasks(taskItem.developer);
            this.teamDevWeekTasks[index] = devWeekTasks;
            devWeekTasks.addTaskForWeek(weekLbl, taskItem);
            index++;
          }
        });
        this.constructColumns();

        if ((!_this.developerComponent.getDeveloperList()) || _this.developerComponent.getDeveloperList().length == 0) {
          _this.developerComponent.refreshDevelopers();
        } else {
          _this.refreshDevNames();
        }
      }
    });
  }
  getDevWeekTasks(developer: string): DevWeekTasks {
    var devWeekTasks = this.teamDevWeekTasks.filter(item => item.devName == developer);
    if (devWeekTasks && devWeekTasks.length > 0) {
      return devWeekTasks[0];
    }
  }

  constructColumns() {
    this.weeks.sort();
    this.weeks.forEach(item => {
      var startDate = moment(this.weekDates.get(item)[this.startDateKey]).format(this.dateFormat);
      var endDate = moment(this.weekDates.get(item)[this.endDateKey]).format(this.dateFormat);
      this.columnsToDisplay.push({ field: 'weekTask.get(' + item + ')', header: item + '  (' + startDate + ')' });
    });
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
  consume<Developer>(type: Developer, data: any[]) {
    this.refreshDevNames();
  }
  refreshDevNames() {
    this.teamDevWeekTasks.forEach(item => {
      var devname = this.developerComponent.getDevName(item.devName);
      if (devname) {
        item.devName = devname;
      }
    });
  }

  addTask(devName: string, week: string, taskIndex: number) {
    if (!this.newTask || this.newTask.trim().length == 0) {
      return;
    }

    var devWeekTask = this.teamDevWeekTasks.filter(item => item.devName == devName);
    if (devWeekTask && devWeekTask.length > 0) {
      var weekTasks = devWeekTask[0].weekTask;
      var tasks = weekTasks.get(week);

      if (!tasks) {
        tasks = [];
      }

      var task;
      if (tasks.length > taskIndex) {
        task = tasks[taskIndex];
      } else {
        task = new Task();
        task.developer = this.developerComponent.getDevId(devName);
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
        this.msgsComponent.showInfo('Task update/added' + item);
      });
    }
  }

  editTask(devName: string, week: string, taskIndex: number) {
    this.selectedTaskId = '';
    var devWeekTask = this.teamDevWeekTasks.filter(item => item.devName == devName);
    if (devWeekTask && devWeekTask.length > 0) {
      var weekTasks = devWeekTask[0].weekTask;
      var tasks = weekTasks.get(week);
      if (tasks && tasks.length > taskIndex) {
        this.newTask = tasks[taskIndex].name;
        this.selectedTaskId = tasks[taskIndex].id;
      }
    }
  }
}

