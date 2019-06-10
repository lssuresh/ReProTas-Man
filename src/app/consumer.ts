import { Type } from '@angular/core';

export interface Consumer {
    consume<T>(_type: Type<T>, data: any[]);

}