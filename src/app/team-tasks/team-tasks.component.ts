import { Component, OnInit, Type } from '@angular/core';

import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/task';
import { timer } from 'rxjs';
import { ObjectFactory } from '../ObjectFactory';
import { TasksComponent } from '../tasks/tasks.component';
import { ProjectsComponent } from '../projects/projects.component';
import { DevelopersComponent } from '../developers/developers.component';

import { DatePipe } from '@angular/common';

import * as moment from 'moment';
import { DevWeekTasks } from './dev-week-tasks';
import { Consumer } from '../consumer';

@Component({
  selector: 'app-team-tasks',
  templateUrl: './team-tasks.component.html',
  styleUrls: ['./team-tasks.component.css']
})
export class TeamTasksComponent implements OnInit, Consumer {

  weekStartRange = 3;
  weekEndRange = 1;

  teamDevWeekTasks: DevWeekTasks[];
  datePipe: DatePipe;
  weeks: string[];
  numOfRows: any[];
  newTask: string;

  columnsToDisplay: any[] = [
    { field: 'devName', header: 'Developer' },
  ];

  constructor(private tasksService: TasksService, private developerComponent: DevelopersComponent,
    private msgsComponent: MsgsComponent, private tasksComponent: TasksComponent) {
    this.developerComponent.addConsumer(this);
  }

  ngOnInit() {

    this.weeks = [];
    this.teamDevWeekTasks = [];
    this.tasksComponent.refreshTasks();
    this.buildUIData();

  }
  calculateNumOfRows() {
    var allRows = 0;
    this.teamDevWeekTasks.forEach(item => allRows = allRows + item.maxTasks);
    this.numOfRows = Array(allRows).fill('');
  }

  buildUIData() {

    let rangeStartMoment = moment().subtract(this.weekStartRange, 'w');
    let dayOfWeek = rangeStartMoment.day();
    var rangeStart = rangeStartMoment.subtract(dayOfWeek - 1, 'd').toDate();

    let rangeEndMoment = moment().add(this.weekEndRange, 'w');
    dayOfWeek = rangeEndMoment.day();
    var rangeEnd = rangeEndMoment.add((7 - dayOfWeek), 'd').toDate();

    this.tasksService.getOpenTasksBetweenDates(rangeStart, rangeEnd).subscribe(tasks => {
      this.teamDevWeekTasks = [];
      var _this = this;
      if (tasks) {
        var index = 0;
        tasks.forEach(taskItem => {
          var devWeekTasks = this.getDevWeekTasks(taskItem.developer);
          var week = moment(taskItem.start_date).format('W');
          //this.weeks.push(week);
          week = this.getWeekLabel(week);
          this.weeks.indexOf(week) == -1 ? this.weeks.push(week) : console.log('Week index already present ' + week);
          if (devWeekTasks) {
            devWeekTasks.addTaskForWeek(week, taskItem);
          } else {
            devWeekTasks = new DevWeekTasks(taskItem.developer);
            this.teamDevWeekTasks[index] = devWeekTasks;
            devWeekTasks.addTaskForWeek(week, taskItem);
            index++;
          }
        });
        this.constructColumns();
        this.calculateNumOfRows();

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
      this.columnsToDisplay.push({ field: 'weekTask.get(' + item + ')', header: item });
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
}

