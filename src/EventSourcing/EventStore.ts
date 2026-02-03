import type EventBus from "./EventBus/EventBus";
import AggregateRootNotFoundException from "./Exception/AggregateRootNotFoundException";
import type IEventStoreDBAL from "./IEventStoreDBAL";
import SnapshotStore from "./Snapshot/SnapshotStore";
import type ISnapshotStoreDBAL from "./Snapshot/SnapshotStoreDBAL";
import type { UpcasterChain } from "./Upcasting/UpcasterChain";
import EventSourcedAggregateRoot from "../Domain/EventSourcedAggregateRoot";
import {AggregateRootId} from "../Domain/AggregateRoot";
import DomainEvent from "../Domain/Event/DomainEvent";
import DomainEventStream from "../Domain/Event/DomainEventStream";
import DomainMessage from "../Domain/Event/DomainMessage";

export type AggregateFactory<T extends EventSourcedAggregateRoot> = new (aggregateRootID: AggregateRootId) => T;

const MIN_SNAPSHOT_MARGIN: number = 10;

export default class EventStore<T extends EventSourcedAggregateRoot> {
    private readonly dbal: IEventStoreDBAL;
    private readonly eventBus: EventBus;
    private readonly snapshotStore?: SnapshotStore<T>;
    private readonly modelConstructor: AggregateFactory<T>;
    private readonly snapshotMargin: number;
    private readonly upcasterChain?: UpcasterChain;

    constructor(
        modelConstructor: AggregateFactory<T>,
        dbal: IEventStoreDBAL,
        eventBus: EventBus,
        snapshotStoreDbal?: ISnapshotStoreDBAL,
        snapshotMargin?: number,
        upcasterChain?: UpcasterChain,
    ) {
        this.modelConstructor = modelConstructor;
        this.dbal = dbal;
        this.eventBus = eventBus;
        this.snapshotMargin = snapshotMargin || MIN_SNAPSHOT_MARGIN;
        this.upcasterChain = upcasterChain;

        if (snapshotStoreDbal) {
            this.snapshotStore = new SnapshotStore(snapshotStoreDbal);
        }
    }

    public async load(aggregateRootId: AggregateRootId): Promise<T> {

        let aggregateRoot: T | null;

        aggregateRoot = await this.fromSnapshot(aggregateRootId);

        let stream: DomainEventStream = await this.dbal.load(
            aggregateRootId,
            aggregateRoot ? aggregateRoot.version() : 0,
        );

        if (stream.isEmpty() && !aggregateRoot) {
            throw new AggregateRootNotFoundException();
        }

        // Apply upcasting to migrate events to their latest versions
        stream = this.applyUpcasting(stream);

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

    /**
     * Applies upcasting to all events in the stream.
     * Events are migrated through the upcaster chain to their latest versions.
     *
     * @param stream - The original event stream
     * @returns A new stream with upcasted events
     */
    private applyUpcasting(stream: DomainEventStream): DomainEventStream {
        if (!this.upcasterChain) {
            return stream;
        }

        const upcastedEvents = stream.events.map((message) => {
            const event = message.event;

            // Only upcast if the event has version property (for upcasting support)
            if (typeof event === 'object' && 'version' in event) {
                const upcastedEvent = this.upcasterChain!.upcast(event as DomainEvent);

                // If event was upcasted, create a new message with the upcasted event
                if (upcastedEvent !== event) {
                    return DomainMessage.create(
                        message.uuid,
                        message.playhead,
                        upcastedEvent,
                        message.metadata,
                    );
                }
            }

            return message;
        });

        return new DomainEventStream(upcastedEvents, stream.name);
    }
}
