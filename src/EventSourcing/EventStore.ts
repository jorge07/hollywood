import type EventBus from "./EventBus/EventBus";
import AggregateRootNotFoundException from "./Exception/AggregateRootNotFoundException";
import type IEventStoreDBAL from "./IEventStoreDBAL";
import SnapshotStore from "./Snapshot/SnapshotStore";
import type ISnapshotStoreDBAL from "./Snapshot/SnapshotStoreDBAL";
import EventSourcedAggregateRoot from "../Domain/EventSourcedAggregateRoot";
import {AggregateRootId} from "../Domain/AggregateRoot";
import DomainEventStream from "../Domain/Event/DomainEventStream";

export type AggregateFactory<T extends EventSourcedAggregateRoot> = new (aggregateRootID: AggregateRootId) => T;

const MIN_SNAPSHOT_MARGIN: number = 10;

export default class EventStore<T extends EventSourcedAggregateRoot> {
    private readonly dbal: IEventStoreDBAL;
    private readonly eventBus: EventBus;
    private readonly snapshotStore?: SnapshotStore<T>;
    private readonly modelConstructor: AggregateFactory<T>;
    private readonly snapshotMargin: number;

    constructor(
        modelConstructor: AggregateFactory<T>,
        dbal: IEventStoreDBAL,
        eventBus: EventBus,
        snapshotStoreDbal?: ISnapshotStoreDBAL,
        snapshotMargin?: number,
    ) {
        this.modelConstructor = modelConstructor;
        this.dbal = dbal;
        this.eventBus = eventBus;
        this.snapshotMargin = snapshotMargin || MIN_SNAPSHOT_MARGIN;

        if (snapshotStoreDbal) {
            this.snapshotStore = new SnapshotStore(snapshotStoreDbal);
        }
    }

    public async load(aggregateRootId: AggregateRootId): Promise<T> {

        let aggregateRoot: T | null;

        aggregateRoot = await this.fromSnapshot(aggregateRootId);

        const stream: DomainEventStream = await this.dbal.load(
            aggregateRootId,
            aggregateRoot ? aggregateRoot.version() : 0,
        );

        if (stream.isEmpty() && !aggregateRoot) {
            throw new AggregateRootNotFoundException();
        }

        aggregateRoot = aggregateRoot || this.aggregateFactory(aggregateRootId);

        return aggregateRoot.fromHistory(stream);
    }

    public async save(entity: T): Promise<void> {

        const stream: DomainEventStream = entity.getUncommittedEvents();

        await this.append(entity.getAggregateRootId(), stream);

        await this.takeSnapshot(entity);

        for (const message of stream.events) {
            await this.eventBus.publish(message);
        }
    }

    public async append(aggregateId: AggregateRootId, stream: DomainEventStream): Promise<void> {

        await this.dbal.append(aggregateId, stream);
    }

    public async replayFrom(uuid: AggregateRootId, from: number, to?: number): Promise<void> {

        const replayStream: DomainEventStream = await this.dbal.loadFromTo(uuid, from, to);

        for (const message of replayStream.events) {
            await this.eventBus.publish(message);
        }
    }

    private async takeSnapshot(entity: T): Promise<void> {

        if (this.snapshotStore && this.isSnapshotNeeded(entity.version())) {

            await this.snapshotStore.snapshot(entity);
        }
    }

    private isSnapshotNeeded(version: number): boolean {

        return version !== 0 && version / this.snapshotMargin >= 1 && version % this.snapshotMargin === 0;
    }

    private async fromSnapshot(aggregateRootId: AggregateRootId): Promise<T|null> {

        if (!this.snapshotStore) {

            return null;
        }

        const snapshot = await this.snapshotStore.retrieve(aggregateRootId);

        if (!snapshot) {

            return null;
        }

        const aggregateRoot = this.aggregateFactory(aggregateRootId);

        aggregateRoot.fromSnapshot(snapshot);

        return aggregateRoot;
    }

    private aggregateFactory(aggregateRootId: AggregateRootId): T {

        return new this.modelConstructor(aggregateRootId);
    }
}
