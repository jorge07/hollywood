import type {AggregateRootId} from "../../Domain/AggregateRoot";
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";

export default interface ISnapshotStoreDBAL {
    get(uuid: AggregateRootId): Promise<any|null>;
    store(entity: EventSourcedAggregateRoot): Promise<void>;
}
