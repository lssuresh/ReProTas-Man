import { Component, OnInit } from '@angular/core';

import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/task';
import { timer } from 'rxjs';
import { ObjectFactory } from '../ObjectFactory';
import { TasksComponent } from '../tasks/tasks.component';
import { ProjectsComponent } from '../projects/projects.component';
import { DevelopersComponent } from '../developers/developers.component';
import { DevWeekTasks } from './team-task';

import { DatePipe } from '@angular/common';

import * as moment from 'moment';

@Component({
  selector: 'app-team-tasks',
  templateUrl: './team-tasks.component.html',
  styleUrls: ['./team-tasks.component.css']
})
export class TeamTasksComponent implements OnInit {

  rowGroupMetadata: any;
  teamTasks: DevWeekTasks[];
  datePipe: DatePipe;

  weekStartRange = 3;
  weekEndRange = 1;

  constructor(private tasksService: TasksService,
    private msgsComponent: MsgsComponent, private tasksComponent: TasksComponent) { }

  ngOnInit() {
    this.tasksComponent.refreshTasks();
    this.updateTeamTasks();
  }
  updateTeamTasks() {
    // this.rowGroupMetadata = {};
    // if (this.tasksComponent.tasksUIData) {
    //   for (let i = 0; i < this.cars.length; i++) {
    //     let rowData = this.cars[i];
    //     let brand = rowData.brand;
    //     if (i == 0) {
    //       this.rowGroupMetadata[brand] = { index: 0, size: 1 };
    //     }
    //     else {
    //       let previousRowData = this.cars[i - 1];
    //       let previousRowGroup = previousRowData.brand;
    //       if (brand === previousRowGroup)
    //         this.rowGroupMetadata[brand].size++;
    //       else
    //         this.rowGroupMetadata[brand] = { index: i, size: 1 };
    //     }
    //   }
    // }
  }

  buildUIData() {

    var rangeStart = moment().subtract(this.weekStartRange, 'w').toDate;

    var rangeEnd = moment().subtract(this.weekEndRange, 'w').toDate;


    var tasks = this.tasksService.getOpenTasksBetweenDates(rangeStart, rangeEnd);



    this.teamTasks = [];
    if (tasks) {
      tasks.forEach(taskItem => {
        DevWeekTasks
        //this.teamTasks.push()
      });

    }
  }
}

