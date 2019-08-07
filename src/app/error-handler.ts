import { ErrorHandler } from '@angular/core';

export class ReproErrorHandler implements ErrorHandler {

  constructor() {
  }
  handleError(error) {
    console.log(error);
    //alert("Error! " + error.message);
  }
}