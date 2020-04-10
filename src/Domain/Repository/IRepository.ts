import type EventSourced from "../AggregateRoot";

export default interface IRepository<T extends EventSourced> {
    save(aggregateRoot: T): Promise<void>;

    load(aggregateRootId: string): Promise<T>;
}
