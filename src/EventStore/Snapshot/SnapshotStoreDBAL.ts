import EventSourced from "../../Domain/AggregateRoot";
import { AggregateRootId } from "../../Domain/AggregateRoot";

export default interface ISnapshotStoreDBAL<T extends EventSourced> {
    get(uuid: AggregateRootId): Promise<T|null>;
    store(entity: T): Promise<void>;
}
