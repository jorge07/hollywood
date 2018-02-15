import { DomainMessage } from './DomainMessage';
import { AggregateRoot } from '../AggregateRoot';

export class DomainEventStream {
    constructor(
        public events: Array<DomainMessage> = [],
        public name: string = 'master'
    ){}
}