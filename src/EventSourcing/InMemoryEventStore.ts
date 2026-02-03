import IEventStoreDBAL from "./IEventStoreDBAL";
import DomainMessage from "../Domain/Event/DomainMessage";
import DomainEventStream from "../Domain/Event/DomainEventStream";
import AggregateRootNotFoundException from "./Exception/AggregateRootNotFoundException";
import ConcurrencyException from "./Exception/ConcurrencyException";

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

    public append(aggregateId: string, stream: DomainEventStream, expectedVersion?: number): void {
        if (! this.events[aggregateId]) {
            this.events[aggregateId] = [];
        }

        if (expectedVersion !== undefined) {
            const currentVersion = this.getCurrentVersion(aggregateId);
            if (currentVersion !== expectedVersion) {
                throw new ConcurrencyException(aggregateId, expectedVersion, currentVersion);
            }
        }

        stream.events.forEach((message: DomainMessage) => {
            this.events[aggregateId].push(message);
        });
    }

    private getCurrentVersion(aggregateId: string): number {
        const events = this.events[aggregateId];
        if (!events || events.length === 0) {
            return -1;
        }
        return events.length - 1;
    }
}
