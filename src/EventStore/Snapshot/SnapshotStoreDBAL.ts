import EventSourced from "../../Domain/AggregateRoot";
import { AggregateRootId } from "../../Domain/AggregateRoot";

export default interface ISnapshotStoreDBAL {
    get(uuid: AggregateRootId): Promise<any|null>;
    store(entity: EventSourced): Promise<void>;
}
