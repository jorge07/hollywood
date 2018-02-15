import { EventStore } from './EventStore'
import { DomainEventStream } from '../Domain/Event/DomainEventStream';
import { DomainEvent } from '../Domain/Event/DomainEvent';
import { AggregateRootNotFoundException } from './Exception/AggregateRootNotFoundException';
import { DomainMessage } from '../Domain/Event/DomainMessage';

export class InMemoryEventStore implements EventStore {

    private _events: Array<any> = []

    load(aggregateId: string) {

        if (this._events[aggregateId]) {
            const stream = new DomainEventStream();
            let events = this._events[aggregateId]

            events.map(
                (event: DomainEvent) => stream.events.push(
                    DomainMessage.create(aggregateId, event)
                )
                
            )

            return stream
        }
        
        throw new AggregateRootNotFoundException()
    }

    append(aggregateId: string, stream: DomainEventStream): void {
        if (! this._events[aggregateId]) {
            this._events[aggregateId] = []
        }

        stream.events.forEach(
            (message: DomainMessage) => (this._events[aggregateId].push(message.event))
        )
    }
}
