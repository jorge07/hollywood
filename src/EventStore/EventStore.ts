import AggregateRootNotFoundException from './Exception/AggregateRootNotFoundException';
import EventBus from './EventBus/EventBus';
import IEventStoreDBAL from './IEventStoreDBAL';
import ISnapshotStoreDBAL from './Snapshot/SnapshotStoreDBAL';
import SnapshotStore from './Snapshot/SnapshotStore';
import { DomainEventStream, DomainEvent, DomainMessage, EventSourced, AggregateRootId } from '../Domain';

const MIN_SNAPSHOT_MARGIN: number = 10

export default class EventStore<T extends EventSourced> {
    private readonly dbal: IEventStoreDBAL;
    private readonly eventBus: EventBus;
    private readonly snapshotStore?: SnapshotStore<T>   
    private readonly modelConstructor;
    private readonly snapshotMargin: number;

    constructor(
        modelConstructor: new () => T, 
        dbal: IEventStoreDBAL, 
        eventBus: EventBus, 
        snapshotStoreDbal?: ISnapshotStoreDBAL<T>,
        snapshotMargin?: number
    ) {
        this.modelConstructor = modelConstructor;
        this.dbal = dbal;
        this.eventBus = eventBus;
        this.snapshotMargin = snapshotMargin || MIN_SNAPSHOT_MARGIN;

        if (snapshotStoreDbal) {
            this.snapshotStore = new SnapshotStore<T>(snapshotStoreDbal);
        }
    }

    async load(aggregateId: AggregateRootId): Promise<T> {
        let from: number = 0;
        let eventSourced: T | null;

        if (this.snapshotStore) {
            eventSourced = await this.snapshotStore.retrieve(aggregateId);

            if (eventSourced) {
                from = eventSourced.version()
            }
        }

        const stream: DomainEventStream = await this.dbal.load(aggregateId, from)

        if (stream.isEmpty()) {
            throw new AggregateRootNotFoundException();
        }

        const entity = eventSourced || this.factory();

        return entity.fromHistory(stream);
    }

    async save(entity: T): Promise<void> {
        const stream: DomainEventStream = entity.getUncommitedEvents();

        await this.dbal.append(entity.getAggregateRootId(), stream);
        
        if (this.snapshotStore && this.needSnapshot(entity.version())) {

            await this.snapshotStore.snapshot(entity)
        }

        stream.events.forEach((message: DomainMessage)=> this.eventBus.publish(message))
    }

    private needSnapshot(version: number): boolean {
        return version !== 0 && version/this.snapshotMargin >= 1 && version%this.snapshotMargin === 0    
    }

    private factory(): T {
        return new (this.modelConstructor)();
    }
}
