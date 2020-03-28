import EventSourced, { AggregateRootId } from "../../Domain/AggregateRoot";
import ISnapshotStoreDBAL from "./SnapshotStoreDBAL";
import { SERVICES_ALIAS } from '../../Framework/Container/Bridge/Alias';
import { inject } from 'inversify';

export default class SnapshotStore {
    constructor(
        @inject(SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL) private readonly store: ISnapshotStoreDBAL
    ) {}

    public async retrieve(aggregateRootId: AggregateRootId): Promise<any> {
        return await this.store.get(aggregateRootId);
    }

    public async snapshot(entity: EventSourced): Promise<void> {
        await this.store.store(entity);
    }
}
