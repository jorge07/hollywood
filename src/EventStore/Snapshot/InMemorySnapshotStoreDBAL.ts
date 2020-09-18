import {AggregateRootId, EventSourcedAggregateRoot} from "../../Domain";
import ISnapshotStoreDBAL from "./SnapshotStoreDBAL";

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
