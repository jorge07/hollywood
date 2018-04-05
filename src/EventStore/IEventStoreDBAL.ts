import { AggregateRootId, DomainEventStream } from "../Domain";

export default interface IEventStoreDBAL {

    load(aggregateId: AggregateRootId, from?: number): Promise<DomainEventStream>;

    append(aggregateId: AggregateRootId, stream: DomainEventStream): void | Promise<any>;
}
