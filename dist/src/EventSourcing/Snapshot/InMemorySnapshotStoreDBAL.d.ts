import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";
import type { AggregateRootId } from "../../Domain/AggregateRoot";
interface ISnapshotDictionary {
    [key: string]: EventSourcedAggregateRoot;
}
export default class InMemorySnapshotStoreDBAL implements ISnapshotStoreDBAL {
    snapshots: ISnapshotDictionary;
    get(uuid: AggregateRootId): Promise<EventSourcedAggregateRoot | null>;
    store(entity: EventSourcedAggregateRoot): Promise<void>;
}
export {};
