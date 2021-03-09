import type EventStore from "../../EventStore/EventStore";
import type IRepository from "./IRepository";
import type EventSourcedAggregateRoot from "../EventSourcedAggregateRoot";

export default abstract class Repository<T extends EventSourcedAggregateRoot> implements IRepository<T> {
    constructor(private readonly eventStore: EventStore<T>) {}

    public async save(aggregateRoot: T): Promise<void> {
        await this.eventStore.save(aggregateRoot);
    }

    public async load(aggregateRootId: string): Promise<T> {
        return this.eventStore.load(aggregateRootId);
    }
}
