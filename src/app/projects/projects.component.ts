import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { timer } from 'rxjs';

import { ProjectsService } from './projects.service';
import { Project } from './Project';
import { ObjectFactory } from '../ObjectFactory';
import { MsgsComponent } from '../msgs/msgs.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonDataComponent } from '../common-data/common-data.component';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  providers: [FormBuilder]
})
export class ProjectsComponent implements OnInit {

  projects: Project[];

  newProject: Project;

  selectedProject: Project;

  displayDialog: boolean;

  addProject: boolean;

  projectForm: FormGroup;

  columnsToDisplay: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'desc', header: 'Desc' },
    { field: 'application', header: 'Application' },
    { field: 'PM', header: 'Project Manager' },
    { field: 'QA_DATE', header: 'QA' },
    { field: 'UAT_DATE', header: 'UAT' },
    { field: 'PROD_DATE', header: 'Prod' },
    { field: 'release', header: 'Release' },
    { field: 'status', header: 'Status' }
  ];

  constructor(private pfb: FormBuilder, private projectService: ProjectsService,
    private msgsComponent: MsgsComponent, private commonDataComponent: CommonDataComponent) { }

  ngOnInit() {
    this.refreshProjects();
    this.newProjectForm();
    this.commonDataComponent.refreshCommonData();
  }

  refreshWithTimer() {
    let source = timer(1000);
    source.subscribe(t => {
      this.refreshProjects();
    });
  }

  refreshProjects() {
    this.projects = [];
    this.projectService.loadProjects().subscribe(projects => {
      console.log("Retrieved Projects ===>" + projects);
      projects.sort((a, b) => {
        if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;
        else return 0;
      });
      this.projects = projects;
      this.msgsComponent.showInfo('Project list refreshed');
      if (projects.length > 0) {
        this.selectedProject = this.projects[0];
      }
    });
  }

  newProjectForm() {
    this.projectForm = this.pfb.group({
      'id': new FormControl(''),
      'elasticType': new FormControl(''),
      'name': new FormControl('', Validators.required),
      'desc': new FormControl('', Validators.required),
      'application': new FormControl('', Validators.required),
      'PM': new FormControl('', Validators.required),
      'QA_DATE': new FormControl('', Validators.required),
      'UAT_DATE': new FormControl('', Validators.required),
      'PROD_DATE': new FormControl('', Validators.required),
      'release': new FormControl('', Validators.required),
      'status': new FormControl('', Validators.required)
    });
  }

  showAddDialog() {
    this.addProject = true;
    this.newProject = new Project();
    this.newProjectForm();
    this.displayDialog = true;
  }
  save() {
    this.selectedProject = ObjectFactory.createNewTypeFrom(this.projectForm, Project);
    let projects = [...this.projects];
    if (this.addProject) {

      this.projectService.addProject(this.selectedProject).subscribe(
        data => {
          console.log(data);
          this.projects.push(this.selectedProject);
          this.msgsComponent.showInfo('Project Saved!');
        }
      );
    } else {
      this.projectService.updateProject(this.selectedProject).subscribe(
        data => {
          console.log(data);
          this.msgsComponent.showInfo('Project Updated!');
        });
      //projects[projects.findIndex(item => item.id == this.selectedProject.id)] = this.selectedProject;

    }

    this.refreshWithTimer();
    console.log("Updated ID" + this.selectedProject.id);
    this.addProject = null;
    this.newProject = null;
    this.displayDialog = false;
  }

  delete() {
    this.projectService.deleteProject(this.selectedProject).subscribe(
      data => {
        console.log("Deleted Successfully!");
        this.refreshWithTimer();
        this.msgsComponent.showInfo('Project Deleted!');
      });
  }

  onRowSelect() {
    if (this.selectedProject) {
      this.addProject = false;
      this.newProject = ObjectFactory.createNewTypeFrom(this.selectedProject, Project);
      (<FormGroup>this.projectForm).setValue(this.selectedProject, { onlySelf: true });
      this.displayDialog = true;
    }
  }
   


  isDate(val): boolean {
    return val instanceof Date;
  }
}
