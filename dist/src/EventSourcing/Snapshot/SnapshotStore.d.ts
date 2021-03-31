import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";
import type { AggregateRootId } from "../../Domain";
export default class SnapshotStore<T extends EventSourcedAggregateRoot> {
    private readonly store;
    constructor(store: ISnapshotStoreDBAL);
    retrieve(aggregateRootId: AggregateRootId): Promise<any>;
    snapshot(entity: T): Promise<void>;
}
