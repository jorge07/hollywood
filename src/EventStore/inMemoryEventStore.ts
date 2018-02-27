import { AggregateRootNotFoundException, EventBus, IEventStore } from ".";
import { DomainEvent, DomainEventStream, DomainMessage } from "../Domain";

export class InMemoryEventStore implements IEventStore {

    private events: any[] = [];
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    public load(aggregateId: string): DomainEventStream {

        if (this.events[aggregateId]) {
            const stream = new DomainEventStream();
            const events = this.events[aggregateId];

            events.forEach((event: DomainEvent) => stream.events.push(DomainMessage.create(aggregateId, event)));

            return stream;
        }

        throw new AggregateRootNotFoundException();
    }

    public append(aggregateId: string, stream: DomainEventStream): void {
        if (! this.events[aggregateId]) {
            this.events[aggregateId] = [];
        }

        stream.events.forEach((message: DomainMessage) => {
            this.events[aggregateId].push(message.event);
            this.eventBus.publish(message);
        });
    }
}
