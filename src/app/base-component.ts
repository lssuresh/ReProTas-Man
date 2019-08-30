import { LocalStorage } from 'angular-web-storage';
import { CommonDataComponent } from './common-data/common-data.component';
import { Component } from '@angular/core';

export abstract class BaseComponent {
    @LocalStorage() isAdmin: boolean;
    @LocalStorage() user: string;
}