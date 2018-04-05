import ISnapshotStoreDBAL from "./SnapshotStoreDBAL"
import EventSourced, { AggregateRootId } from '../../Domain/AggregateRoot';

export default class SnapshotStore<T extends EventSourced> {
    constructor(private readonly store: ISnapshotStoreDBAL<T>) {}

    async retrieve(aggregateRootId: AggregateRootId): Promise<T> {
        return <T> await this.store.get(aggregateRootId)
    }

    async snapshot(entity: T): Promise<void> {
        await this.store.store(entity);
    }
}
