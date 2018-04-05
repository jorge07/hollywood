import { DomainEvent, DomainEventStream, DomainMessage } from ".";

export type AggregateRootId = string;

export default abstract class AggregateRoot {
    public abstract getAggregateRootId(): AggregateRootId;
}
