import type EventBus from "./EventBus/EventBus";
import type IEventStoreDBAL from "./IEventStoreDBAL";
import type ISnapshotStoreDBAL from "./Snapshot/SnapshotStoreDBAL";
import EventSourcedAggregateRoot from "../Domain/EventSourcedAggregateRoot";
import { AggregateRootId } from "../Domain/AggregateRoot";
import DomainEventStream from "../Domain/Event/DomainEventStream";
export declare type AggregateFactory<T extends EventSourcedAggregateRoot> = new (aggregateRootID: AggregateRootId) => T;
export default class EventStore<T extends EventSourcedAggregateRoot> {
    private readonly dbal;
    private readonly eventBus;
    private readonly snapshotStore?;
    private readonly modelConstructor;
    private readonly snapshotMargin;
    constructor(modelConstructor: AggregateFactory<T>, dbal: IEventStoreDBAL, eventBus: EventBus, snapshotStoreDbal?: ISnapshotStoreDBAL, snapshotMargin?: number);
    load(aggregateRootId: AggregateRootId): Promise<T>;
    save(entity: T): Promise<void>;
    append(aggregateId: AggregateRootId, stream: DomainEventStream): Promise<void>;
    replayFrom(uuid: AggregateRootId, from: number, to?: number): Promise<void>;
    private takeSnapshot;
    private isSnapshotNeeded;
    private fromSnapshot;
    private aggregateFactory;
    private static emptyStream;
}
