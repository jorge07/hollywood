import {AggregateRootId, DomainEventStream, DomainMessage} from "../Domain";

export default interface IEventStoreDBAL {

    load(aggregateId: AggregateRootId, from?: number): Promise<DomainEventStream>;

    loadFromTo(aggregateId: AggregateRootId, from?: number, to?: number): Promise<DomainEventStream>;

    append(aggregateId: AggregateRootId, stream: DomainEventStream, expectedVersion?: number): void | Promise<any>;

    /**
     * Load all events from the event store starting from a global position.
     * Used for projection rebuilds and catch-up operations.
     * @param fromPosition - Global position to start from (0 for beginning)
     */
    loadAll(fromPosition?: number): AsyncIterable<DomainMessage>;
}
