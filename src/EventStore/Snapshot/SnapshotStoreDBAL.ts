import {AggregateRootId, EventSourcedAggregateRoot} from "../../Domain";

export default interface ISnapshotStoreDBAL {
    get(uuid: AggregateRootId): Promise<any|null>;
    store(entity: EventSourcedAggregateRoot): Promise<void>;
}
