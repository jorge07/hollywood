import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";

interface ISnapshotDictionary {
    [key: string]: EventSourcedAggregateRoot;
}

export default class InMemorySnapshotStoreDBAL implements ISnapshotStoreDBAL {

    public snapshots: ISnapshotDictionary = {};

    public async get(uuid: string): Promise<EventSourcedAggregateRoot|null> {

        return this.snapshots[uuid];
    }

    public async store(entity: EventSourcedAggregateRoot): Promise<void> {

        this.snapshots[entity.getAggregateRootId().toString()] = Object.assign({}, entity);
    }
}
