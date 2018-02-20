import { EventStore } from './EventBus/EventStore'
import { DomainEventStream } from '../Domain/Event/DomainEventStream';
import { DomainEvent } from '../Domain/Event/DomainEvent';
import { AggregateRootNotFoundException } from './Exception/AggregateRootNotFoundException';
import { DomainMessage } from '../Domain/Event/DomainMessage';
import {EventBus} from "./EventBus";

export class InMemoryEventStore implements EventStore {

    private _events: Array<any> = [];
    private _eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this._eventBus = eventBus;
    }

    load(aggregateId: string): DomainEventStream {

        if (this._events[aggregateId]) {
            const stream = new DomainEventStream();
            let events = this._events[aggregateId];

            events.forEach((event: DomainEvent) => stream.events.push(DomainMessage.create(aggregateId, event)));

            return stream
        }
        
        throw new AggregateRootNotFoundException()
    }

    append(aggregateId: string, stream: DomainEventStream): void {
        if (! this._events[aggregateId]) {
            this._events[aggregateId] = []
        }

        stream.events.forEach((message: DomainMessage) => {
            this._events[aggregateId].push(message.event);
            this._eventBus.publish(message);
        });
    }
}
