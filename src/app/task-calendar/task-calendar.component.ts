import { Component, OnInit } from '@angular/core';

import { MsgsComponent } from '../msgs/msgs.component';
import { TasksService } from '../tasks/tasks.service';
import { ActivatedRoute } from '@angular/router';
import { DevelopersService } from '../developers/developers.service';
import { Task } from '../tasks/task';
import { TasksComponent } from '../tasks/tasks.component';
import { TaskUIData } from '../tasks/TaskUIData';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { LocalStorageService } from 'angular-web-storage';


@Component({
  selector: 'app-task-calendar',
  templateUrl: './task-calendar.component.html',
  styleUrls: ['./task-calendar.component.css']
})
export class TaskCalendarComponent implements OnInit {

  options: any;

  calendarTasks: any[];

  developer;
  devId;
  selectedDate: Date;

  selectedTask: Task;

  calendarPlugins = [dayGridPlugin, interactionPlugin];

  constructor(private route: ActivatedRoute, private tasksService: TasksService,
    private msgsComponent: MsgsComponent,
    private developerService: DevelopersService,
    private tasksComponent: TasksComponent, private localStorage: LocalStorageService) {
    this.developer = localStorage.get('user');
  }

  ngOnInit() {
    this.refreshData();

    this.options = {
      defaultView: "dayGridMonth",
      plugins: [dayGridPlugin, interactionPlugin],
      defaultDate: new Date(),
      selectable: true,
      header: {
        left: 'prev,next',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      weekends: false,
      height: 500,
      contentHeight: 'auto',
      dateClick: (e) => {
        this.onDateSelect(e);
      },
      eventClick: (e) => {
        this.setSelectTask(e);
      }
    }
  }
  refreshData() {
    if (this.developer) {
      this.developerService.getDeveloperWithName(this.developer).subscribe(developer => {
        if (developer && developer[0]) {
          this.devId = developer[0].id;
          this.tasksService.getTasksForDev(developer[0].id).subscribe(tasks => this.displayTasks(tasks));
        }
      });
    } else {
      this.tasksService.loadTasks().subscribe(tasks => this.displayTasks(tasks));
    }
  }
  setSelectTask(event) {
    if (event.event._def.extendedProps.task) {
      this.selectedTask = event.event._def.extendedProps.task;
    }
    this.tasksComponent.displayDialog = true;
  }
  onDateSelect(info) {
    this.showAddDialog(info.date);
  }

  displayTasks(tasks) {
    var tempCalendarTasks = [];
    tasks.forEach(task => {
      tempCalendarTasks.push(this.createCalEntry(task));
    });

    // changing array will trigger calendar repaint
    this.calendarTasks = [...tempCalendarTasks]
  }
  createCalEntry(task: Task) {
    return { "title": task.name, "start": task.start_date, "end": task.end_date, "task": task };
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
      this.tasksComponent.showAddDialogWithDateAndDev(this.selectedDate, this.devId);
    }
    console.log(event);
  }

  // Add dialog will send this when new task is added.
  dialogDataChanged(event) {
    if (!event.id) {
      this.calendarTasks = this.calendarTasks.concat(...[this.createCalEntry(event)]);
    } else {
      var newCalTasks = this.calendarTasks.filter(item => item.task.id != event.id);
      this.calendarTasks = newCalTasks.concat(...[this.createCalEntry(event)]);
    }
  }
  showAddDialog(startDate: Date): void {
    this.selectedTask = new Task();
    this.selectedDate = startDate;
    this.tasksComponent.displayDialog = true;
  }
}
