import { AggregateRootId } from "../../Domain/AggregateRoot";
import EventSourced from "../../Domain/EventSourced";
import ISnapshotStoreDBAL from "./SnapshotStoreDBAL";

interface ISnapshotDictionary {
    [x: string]: EventSourced;
}

export default class InMemorySnapshotStoreDBAL implements ISnapshotStoreDBAL {

    public snapshots: ISnapshotDictionary = {};

    public async get(uuid: AggregateRootId): Promise<EventSourced|null> {

        return this.snapshots[uuid] as EventSourced || null;
    }

    public async store(entity: EventSourced): Promise<void> {

        this.snapshots[entity.getAggregateRootId()] = Object.assign({}, entity);
    }
}
