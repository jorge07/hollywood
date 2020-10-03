import { AggregateRootId, EventSourcedAggregateRoot } from "../../Domain";
import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import { SERVICES_ALIAS } from '../../Framework';
import { inject } from 'inversify';

export default class SnapshotStore<T extends EventSourcedAggregateRoot> {
    constructor(
        @inject(SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL) private readonly store: ISnapshotStoreDBAL
    ) {}

    public async retrieve(aggregateRootId: AggregateRootId): Promise<any> {
        return await this.store.get(aggregateRootId);
    }

    public async snapshot(entity: T): Promise<void> {
        await this.store.store(entity);
    }
}
