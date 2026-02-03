import type EventSourcedAggregateRoot from "../AggregateRoot";
import type { Identity } from "../AggregateRoot";

export default interface IRepository<T extends EventSourcedAggregateRoot> {
    save(aggregateRoot: T): Promise<void>;

    load(aggregateRootId: Identity): Promise<T>;
}
