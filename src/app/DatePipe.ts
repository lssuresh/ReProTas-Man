import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'dateFormatPipe',
})
export class DateFormatPipe implements PipeTransform {
    transform(value: Date) {
        if (value != null) {
            var datePipe = new DatePipe("en-US");
            return datePipe.transform(value, 'MM/dd/yyyy');
        }
    }
}
