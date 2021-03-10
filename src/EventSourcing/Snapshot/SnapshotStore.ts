import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import { inject } from 'inversify';
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";
import  * as Aliases from "../../Framework";
import type {AggregateRootId} from "../../Domain";

export default class SnapshotStore<T extends EventSourcedAggregateRoot> {
    constructor(
        @inject(Aliases.SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL) private readonly store: ISnapshotStoreDBAL
    ) {}

    public async retrieve(aggregateRootId: AggregateRootId): Promise<any> {
        return this.store.get(aggregateRootId);
    }

    public async snapshot(entity: T): Promise<void> {
        await this.store.store(entity);
    }
}
