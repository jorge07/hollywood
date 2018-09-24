import EventBus from "../../EventStore/EventBus/EventBus";
import EventStore from "../../EventStore/EventStore";
import EventSourced from "../EventSourced";
import IRepository from "./IRepository";

export default abstract class Repository<T extends EventSourced> implements IRepository<T> {

    constructor(private readonly eventStore: EventStore<T>) {
    }

    public async save(aggregateRoot: T): Promise<void> {
        await this.eventStore.save(aggregateRoot);
    }

    public async load(aggregateRootId: string): Promise<T> {
        return await this.eventStore.load(aggregateRootId);
    }
}
