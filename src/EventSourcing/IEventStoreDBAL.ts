import {DomainEventStream, DomainMessage} from "../Domain";

export default interface IEventStoreDBAL {

    load(aggregateId: string, from?: number): Promise<DomainEventStream>;

    loadFromTo(aggregateId: string, from?: number, to?: number): Promise<DomainEventStream>;

    append(aggregateId: string, stream: DomainEventStream, expectedVersion?: number): void | Promise<any>;

    /**
     * Load all events from the event store starting from a global position.
     * Used for projection rebuilds and catch-up operations.
     * @param fromPosition - Global position to start from (0 for beginning)
     */
    loadAll(fromPosition?: number): AsyncIterable<DomainMessage>;
}
