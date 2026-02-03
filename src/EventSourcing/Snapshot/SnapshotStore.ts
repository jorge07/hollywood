import type ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import { decorate, inject, injectable } from 'inversify';
import type EventSourcedAggregateRoot from "../../Domain/EventSourcedAggregateRoot";
import { SERVICES_ALIAS } from "../../Framework";
import type {AggregateRootId} from "../../Domain";

export default class SnapshotStore<T extends EventSourcedAggregateRoot> {
    constructor(
        private readonly store: ISnapshotStoreDBAL
    ) {}

    public async retrieve(aggregateRootId: AggregateRootId): Promise<any> {
        return this.store.get(aggregateRootId);
    }

    public async snapshot(entity: T): Promise<void> {
        await this.store.store(entity);
    }
}

decorate(injectable(), SnapshotStore);
decorate(inject(SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL) as ParameterDecorator, SnapshotStore, 0);
