import { Consumer } from './consumer';

export interface Producer {
    addConsumer(consumer: Consumer);
    removeConsumer(consumer: Consumer);
}