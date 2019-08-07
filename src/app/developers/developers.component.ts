import { Component, OnInit, Injectable } from '@angular/core';

import { CommonDataComponent } from '../common-data/common-data.component';
import { DevelopersService } from './developers.service';
import { Developer } from './Developer';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MsgsComponent } from '../msgs/msgs.component';
import { timer, Subject } from 'rxjs';
import { ObjectFactory } from '../ObjectFactory';

@Component({
  selector: 'app-developers',
  templateUrl: './developers.component.html',
  styleUrls: ['./developers.component.css']
})
@Injectable()
export class DevelopersComponent implements OnInit {

  developers: Developer[];

  newDeveloper: Developer;

  selectedDeveloper: Developer;

  displayDialog: boolean;

  addDeveloper: boolean;

  developerForm: FormGroup;

  selectedRelease: string;

  developerListSubject: Subject<Developer[]>;

  columnsToDisplay: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'userId', header: 'User Id' },
    { field: 'phone', header: 'Home Phone' },
    { field: 'mobile', header: 'Mobile' },
    { field: 'email', header: 'Email' },
    { field: 'work_hours', header: 'Work Hours' },
    { field: 'status', header: 'Status' }
  ];



  constructor(private pfb: FormBuilder, private developerService: DevelopersService,
    private msgsComponent: MsgsComponent, private commonDataComponent: CommonDataComponent) {
    this.developers = [];
    this.developerListSubject = new Subject();
    this.developerListSubject.next(this.developers);
  }

  ngOnInit() {
    this.refreshDevelopers();
    this.newDeveloperForm();
    this.commonDataComponent.refreshCommonData();
  }

  refreshWithTimer() {
    let source = timer(1000);
    source.subscribe(t => {
      this.refreshDevelopers();
    });
  }

  refreshDevelopers() {
    this.developerService.loadDevelopers().subscribe(developers => {
      this.developers = [];
      console.log("Retrieved Developers ===>" + developers);
      developers.sort((a, b) => {
        if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;
        else return 0;
      });
      this.developers = developers;
      this.msgsComponent.showInfo('Developer list refreshed');
      if (developers.length > 0) {
        this.selectedDeveloper = this.developers[0];
      }

      this.developerListSubject.next(this.developers);
    });
  }

  newDeveloperForm() {
    this.developerForm = this.pfb.group({
      'id': new FormControl(''),
      'elasticType': new FormControl(''),
      'userId': new FormControl('', Validators.required),
      'updated_by': new FormControl(''),
      'updated_date': new FormControl(''),
      'name': new FormControl('', Validators.required),
      'phone': new FormControl('', Validators.required),
      'mobile': new FormControl('', Validators.required),
      'email': new FormControl('', Validators.required),
      'work_hours': new FormControl('', Validators.required),
      'status': new FormControl('', Validators.required)
    });
  }

  showAddDialog() {
    this.addDeveloper = true;
    this.newDeveloper = new Developer();
    this.newDeveloperForm();
    this.displayDialog = true;
  }
  save() {
    this.selectedDeveloper = ObjectFactory.createNewTypeFrom(this.developerForm, Developer);
    let developers = [...this.developers];
    if (this.addDeveloper) {

      this.developerService.addDeveloper(this.selectedDeveloper).subscribe(
        data => {
          console.log(data);
          this.developers.push(this.selectedDeveloper);
          this.msgsComponent.showInfo('Developer data Saved!');
        }
      );
    } else {
      this.developerService.updateDeveloper(this.selectedDeveloper).subscribe(
        data => {
          console.log(data);
          this.msgsComponent.showInfo('Developer Updated!');
        });

    }
    this.refreshWithTimer();
    console.log("Updated ID" + this.selectedDeveloper.id);
    this.addDeveloper = null;
    this.newDeveloper = null;
    this.displayDialog = false;
  }

  delete() {
    this.developerService.deleteDeveloper(this.selectedDeveloper).subscribe(
      data => {
        console.log("Deleted Successfully!");
        this.developers = this.developers.filter(dev => dev.name != this.selectedDeveloper.name);
        this.refreshWithTimer();
        this.msgsComponent.showInfo('Developer Deleted!');
      });
  }

  onRowSelect() {
    if (this.selectedDeveloper) {
      this.addDeveloper = false;
      this.selectedDeveloper.userId = 'Test';
      this.newDeveloper = ObjectFactory.createNewTypeFrom(this.selectedDeveloper, Developer);
      (<FormGroup>this.developerForm).setValue(this.selectedDeveloper, { onlySelf: true });
      this.displayDialog = true;
    }
  }

  getDevName(id: string): string {
    var name = "";
    this.developers.forEach(item => {
      if (item.id == id) {
        name = item.name;
        return;
      }
    });
    return name;
  }
  getDeveloperList(): Developer[] {
    return this.developers;
  }

  isDate(val): boolean {
    return val instanceof Date;
  }

}