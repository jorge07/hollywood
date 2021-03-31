import type EventStore from "../../EventSourcing/EventStore";
import type IRepository from "./IRepository";
import type EventSourcedAggregateRoot from "../EventSourcedAggregateRoot";
export default abstract class Repository<T extends EventSourcedAggregateRoot> implements IRepository<T> {
    private readonly eventStore;
    constructor(eventStore: EventStore<T>);
    save(aggregateRoot: T): Promise<void>;
    load(aggregateRootId: string): Promise<T>;
}
