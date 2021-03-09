import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";
import type {AggregateRootId} from "../../Domain/AggregateRoot";

interface ISnapshotDictionary {
    [key: string]: EventSourcedAggregateRoot;
}

export default class InMemorySnapshotStoreDBAL implements ISnapshotStoreDBAL {

    public snapshots: ISnapshotDictionary = {};

    public async get(uuid: AggregateRootId): Promise<EventSourcedAggregateRoot|null> {

        return this.snapshots[uuid];
    }

    public async store(entity: EventSourcedAggregateRoot): Promise<void> {

        this.snapshots[entity.getAggregateRootId()] = Object.assign({}, entity);
    }
}
