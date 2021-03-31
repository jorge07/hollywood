import type EventSourcedAggregateRoot from "../AggregateRoot";
export default interface IRepository<T extends EventSourcedAggregateRoot> {
    save(aggregateRoot: T): Promise<void>;
    load(aggregateRootId: string): Promise<T>;
}
