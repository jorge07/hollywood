import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import { inject } from 'inversify';
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";
import {SERVICES_ALIAS} from "../../Framework/Container/Bridge/Alias";
import type {AggregateRootId} from "../../Domain/AggregateRoot";

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
