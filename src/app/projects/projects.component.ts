import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { timer } from 'rxjs';

import { ProjectsService } from './projects.service';
import { Project } from './Project';
import { ObjectFactory } from '../ObjectFactory';
import { MsgsComponent } from '../msgs/msgs.component';
import { CommonDataComponent } from '../common-data/common-data.component';
import { MenuItem } from 'primeng/components/common/api';
import { DataTable } from 'primeng/primeng';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from 'angular-web-storage';
import { BaseComponent } from '../base-component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  providers: [FormBuilder]
})
export class ProjectsComponent extends BaseComponent implements OnInit {

  projects: Project[];

  newProject: Project;

  selectedProject: Project;

  displayDialog: boolean;

  addProject: boolean;

  projectForm: FormGroup;

  statusParam: string;
  projectParam: string;
  releaseParam: string;

  @ViewChild('dt')
  dataTable: DataTable;

  appFilter: string;


  columnsToDisplay: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'desc', header: 'Desc' },
    { field: 'application', header: 'Application' },
    { field: 'PM', header: 'Project Manager' },
    { field: 'QA_DATE', header: 'QA' },
    { field: 'UAT_DATE', header: 'UAT' },
    { field: 'PROD_DATE', header: 'Prod' },
    { field: 'release', header: 'Release' },
    { field: 'status', header: 'Statuses' }
  ];

  menuItems: MenuItem[];

  constructor(private route: ActivatedRoute, private pfb: FormBuilder, private projectService: ProjectsService,
    private msgsComponent: MsgsComponent, private commonDataComponent: CommonDataComponent) {
    super();
    this.route.queryParams.subscribe(params => {
      this.statusParam = params['status'];
      this.projectParam = params['project'];
      this.releaseParam = params['releaseNode'];
    });
  }

  ngOnInit() {
    this.refreshProjects();
    this.newProjectForm();
    this.commonDataComponent.refreshCommonData();

    this.menuItems = [
      { label: 'New ', icon: 'pi pi-plus', command: (event) => this.showAddDialog() },
      { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.editProject() },
      { label: 'Delete', icon: 'pi pi-times', command: (event) => this.delete() }
    ];
  }

  refreshWithTimer() {
    let source = timer(1000);
    source.subscribe(t => {
      this.refreshProjects();
    });
  }

  refreshProjects() {
    this.newProjectForm();
    this.commonDataComponent.refreshCommonData(true);
    this.projects = [];
    if (this.statusParam) {
      this.projectService.getProjectsWithStatus(this.statusParam).subscribe(projects => this.processProjects(projects));
    } else {
      this.projectService.getNotClosedProjects().subscribe(projects => this.processProjects(projects));
    }
  }
  processProjects(projects) {
    console.log("Retrieved Projects ===>" + projects);
    projects.sort((a, b) => {
      if (a.name < b.name) return -1;
      else if (a.name > b.name) return 1;
      else return 0;
    });
    this.projects = projects;
    this.msgsComponent.showInfo('Project list refreshed');
    if (projects.length > 0) {
      this.setSelectedProject();

    }
  }

  setSelectedProject() {
    if (this.projectParam) {
      var filteredProject = this.projects.filter(project => project.name == this.projectParam);
      if (filteredProject && filteredProject.length > 0) {
        this.selectedProject = filteredProject[0];
      }
    } else {
      this.selectedProject = this.projects[0];
    }
  }

  newProjectForm() {
    this.projectForm = this.pfb.group({
      'id': new FormControl(''),
      'elasticType': new FormControl(''),
      'updated_by': new FormControl(''),
      'updated_date': new FormControl(''),
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

    if (this.selectedProject && this.selectedProject.status == 'Closed') {
      this.msgsComponent.showInfo('Closed Project cannot be changed!');
      return;
    }

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

  editProject() {
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

  clearFilters() {
    this.dataTable.filter('', 'application', 'in');
  }
}


