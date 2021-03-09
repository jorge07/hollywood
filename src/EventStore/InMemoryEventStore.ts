import IEventStoreDBAL from "./IEventStoreDBAL";
import DomainMessage from "../Domain/Event/DomainMessage";
import DomainEventStream from "../Domain/Event/DomainEventStream";
import AggregateRootNotFoundException from "./Exception/AggregateRootNotFoundException";

export default class InMemoryEventStore implements IEventStoreDBAL {
    private readonly events: { [key: string]: DomainMessage[] } = {};

    public load(aggregateId: string, from: number = 0): Promise<DomainEventStream> {
        if (this.events[aggregateId]) {
            const events = this.events[aggregateId];
            const stream = new DomainEventStream(events.slice(from));

            return Promise.resolve(stream);
        }

        throw new AggregateRootNotFoundException();
    }
    public loadFromTo(aggregateId: string, from: number = 0, to?: number): Promise<DomainEventStream> {
        if (this.events[aggregateId]) {
            const events: DomainMessage[] = this.events[aggregateId];

            const stream = new DomainEventStream(events.slice(from, to));

            return Promise.resolve(stream);
        }

        throw new AggregateRootNotFoundException();
    }

    public append(aggregateId: string, stream: DomainEventStream): void {
        if (! this.events[aggregateId]) {
            this.events[aggregateId] = [];
        }

        stream.events.forEach((message: DomainMessage) => {
            this.events[aggregateId].push(message);
        });
    }
}
