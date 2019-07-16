import { Component, OnInit } from '@angular/core';
import { ListboxModule } from 'primeng/listbox';
import { SelectItem } from 'primeng/api';
import { CommonDataService } from './common-data.service';
import { CommonData } from './common-data';
import { SingleCommonData } from './single-common-data';
import { MsgsComponent } from '../msgs/msgs.component';
import { timer, Observable } from 'rxjs';
import { DropDownCommonData } from './dropdown-common-data'
import { of } from "rxjs";

@Component({
  selector: 'app-common-data',
  templateUrl: './common-data.component.html',
  styleUrls: ['./common-data.component.css']
})
export class CommonDataComponent implements OnInit {


  RELEASES_KEY = 'Releases';
  PROJECT_STATUS_KEY = 'ProjectStatus';
  PROJECT_MANAGER_KEY = 'ProjectManager';
  DEVELOPER_STATUS = 'DeveloperStatus';
  APPLICATIONS = "Applications";
  TASK_STATUS = 'TaskStatus';

  private commonData: CommonData;


  dropdownItemsMap: Map<string, DropDownCommonData>;

  releases: DropDownCommonData = { selectedItem: '', itemList: [] };
  projectManagers: DropDownCommonData = { selectedItem: '', itemList: [] };
  projectStatuses: DropDownCommonData = { selectedItem: '', itemList: [] };
  developerStatuses: DropDownCommonData = { selectedItem: '', itemList: [] };
  applications: DropDownCommonData = { selectedItem: '', itemList: [] };
  taskStatuses: DropDownCommonData = { selectedItem: '', itemList: [] };

  constructor(private commonDataService: CommonDataService, private msgsComponent: MsgsComponent) {

    this.dropdownItemsMap = new Map<string, DropDownCommonData>();
    this.dropdownItemsMap.set(this.RELEASES_KEY, this.releases);
    this.dropdownItemsMap.set(this.PROJECT_MANAGER_KEY, this.projectManagers);
    this.dropdownItemsMap.set(this.PROJECT_STATUS_KEY, this.projectStatuses);
    this.dropdownItemsMap.set(this.DEVELOPER_STATUS, this.developerStatuses);
    this.dropdownItemsMap.set(this.APPLICATIONS, this.applications);
    this.dropdownItemsMap.set(this.TASK_STATUS, this.taskStatuses);

    this.createCommonData();

    for (let value of Array.from(this.dropdownItemsMap.values())) {
      value.itemList = [];
    }
  }
  ngOnInit() {
    this.refreshCommonData();
  }

  createCommonData() {
    if (!this.commonData) {
      this.commonData = new CommonData();
    }

    this.commonData.clearDataList();

    for (let key of Array.from(this.dropdownItemsMap.keys())) {
      this.addEmptyList(key);
    }
  }

  addEmptyList(name: string) {
    var singleCommonData = new SingleCommonData();
    singleCommonData.name = name;
    this.commonData.getDataList().push(singleCommonData);
  }

  refreshWithCommonDataWithTimer() {
    let source = timer(1000);
    source.subscribe(t => {
      this.refreshCommonData();
    });
  }


  refreshCommonData(): Observable<CommonData> {
    var observerRef;
    this.commonDataService.getCommonData().subscribe(data => {
      if (data && data[0]) {
        this.commonData = data[0];
        this.loadeAllCommonData();
        if (observerRef) {
          observerRef.next(this.commonData);
          observerRef.complete();
        }
      } else {
        console.log("No Common Data found");
      }
    });
    return Observable.create(observer => {
      observerRef = observer;
    });
  }

  loadeAllCommonData() {
    this.dropdownItemsMap.forEach((value: DropDownCommonData, key: string) => {
      value.itemList = this.createSelectItems(this.getCommonDataForType(key));
      if (value.itemList) {
        value.itemList.sort();
      }
    });
  }

  getCommonDataForType(name: string): string[] {
    if (this.commonData) {
      var dataList = this.commonData.getDataList().filter(element => {
        return element.name == name
      });

      if (dataList && dataList.length > 0) {
        return dataList[0].value;
      }
    }
    return [];
  }
  createSelectItems(items: string[]) {
    var selectedItems = [];
    if (items) {
      items.forEach(item => {
        selectedItems = [...selectedItems, { label: item, value: item }];
      });
    }
    return selectedItems;
  }

  addCommonData(items: any[], item: string) {
    return [...items, { label: item, value: item }];
  }
  deleteCommonData(items: any[], item: string) {
    return items.filter(indexItem => indexItem.value != item);
  }

  syncCommonDataNew() {
    var dataList = [];
    this.createCommonData();

    var _this = this;
    this.commonData.getDataList().forEach(item => {
      var commonDataType = _this.dropdownItemsMap.get(item.name);
      item.value = commonDataType.itemList.map(listItem => listItem.value);
    });


    this.commonDataService.upsertData(this.commonData).subscribe(data => {
      if (data) {
        this.refreshWithCommonDataWithTimer();
        console.log("Common Data Processed!");
        this.msgsComponent.showInfo("Common Data Syncd!");
      } else {
        console.log("Common Data Could not be Processed");
        this.msgsComponent.showError("Common Data could not be processed!");
      }
    });
  }


  addData(name) {
    var dropDownItems = this.dropdownItemsMap.get(name);
    dropDownItems.itemList = this.addCommonData(dropDownItems.itemList, dropDownItems.selectedItem);
    dropDownItems.itemList.sort();
    dropDownItems.selectedItem = '';
    this.syncCommonDataNew();
  }

  deleteData(name) {
    var dropDownItems = this.dropdownItemsMap.get(name);
    dropDownItems.itemList = this.deleteCommonData(dropDownItems.itemList, dropDownItems.selectedItem);
    dropDownItems.itemList.sort();
    dropDownItems.selectedItem = '';
    this.syncCommonDataNew();
  }
  clearData(name) {
    var dropDownItems = this.dropdownItemsMap.get(name);
    dropDownItems.selectedItem = '';
  }

}

