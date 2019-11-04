import { DomainEvent, DomainEventStream, DomainMessage } from ".";

export type AggregateRootId = string;

export default abstract class AggregateRoot {
    private readonly aggregateRootId: AggregateRootId;

    constructor(aggregateRootId: AggregateRootId) {
        this.aggregateRootId = aggregateRootId;
    }

    public getAggregateRootId(): AggregateRootId {
        return this.aggregateRootId;
    }
}
