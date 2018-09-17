import { AggregateRootNotFoundException, IEventStoreDBAL } from ".";
import { DomainEvent, DomainEventStream, DomainMessage } from "../Domain";

export default class InMemoryEventStore implements IEventStoreDBAL {
    private readonly events: any[] = [];

    public load(aggregateId: string, from: number = 0): Promise<DomainEventStream> {
        if (this.events[aggregateId]) {
            const events = this.events[aggregateId];

            const stream = new DomainEventStream(
                events
                    .slice(from),
            );

            return new Promise((resolve, rejesct) => resolve(stream));
        }

        throw new AggregateRootNotFoundException();
    }
    public loadFromTo(aggregateId: string, from: number = 0, to?: number): Promise<DomainEventStream> {
        if (this.events[aggregateId]) {
            const events: Array<DomainMessage> = this.events[aggregateId];

            const stream = new DomainEventStream(
                events
                    .slice(from, to),
            );

            return new Promise((resolve, rejesct) => resolve(stream));
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
