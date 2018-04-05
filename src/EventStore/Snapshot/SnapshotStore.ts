import EventSourced, { AggregateRootId } from "../../Domain/AggregateRoot";
import ISnapshotStoreDBAL from "./SnapshotStoreDBAL";

export default class SnapshotStore<T extends EventSourced> {
    constructor(private readonly store: ISnapshotStoreDBAL<T>) {}

    public async retrieve(aggregateRootId: AggregateRootId): Promise<T> {
        return await this.store.get(aggregateRootId) as T;
    }

    public async snapshot(entity: T): Promise<void> {
        await this.store.store(entity);
    }
}
