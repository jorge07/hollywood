import EventSourced, { AggregateRootId } from "../../Domain/AggregateRoot";
import ISnapshotStoreDBAL from "./SnapshotStoreDBAL";

export default class SnapshotStore {
    constructor(private readonly store: ISnapshotStoreDBAL) {}

    public async retrieve(aggregateRootId: AggregateRootId): Promise<any> {
        return await this.store.get(aggregateRootId);
    }

    public async snapshot(entity: EventSourced): Promise<void> {
        await this.store.store(entity);
    }
}
