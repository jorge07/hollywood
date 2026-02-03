import InMemoryEventStore from '../../src/EventSourcing/InMemoryEventStore';
import DomainMessage from '../../src/Domain/Event/DomainMessage';
import DomainEventStream from '../../src/Domain/Event/DomainEventStream';
import DomainEvent from '../../src/Domain/Event/DomainEvent';
import InMemoryReadModelRepository from '../../src/ReadModel/InMemoryReadModelRepository';
import InMemoryProjectionPositionStore from '../../src/ReadModel/InMemoryProjectionPositionStore';
import ProjectionManager from '../../src/ReadModel/ProjectionManager';
import Projector from '../../src/ReadModel/Projector';

class UserCreated extends DomainEvent {
    constructor(public readonly userId: string, public readonly name: string) {
        super();
    }
}

class UserNameChanged extends DomainEvent {
    constructor(public readonly userId: string, public readonly newName: string) {
        super();
    }
}

class UserReadModelProjector extends Projector {
    constructor(private readonly repository: InMemoryReadModelRepository) {
        super();
    }

    onUserCreated(event: UserCreated): void {
        this.repository.save(event.userId, { name: event.name, version: 1 });
    }

    onUserNameChanged(event: UserNameChanged): void {
        const existing = this.repository.oneOrFail(event.userId);
        this.repository.save(event.userId, {
            name: event.newName,
            version: existing.version + 1
        });
    }
}

// Simulates a "fixed" projector after a bug fix
class FixedUserReadModelProjector extends Projector {
    constructor(private readonly repository: InMemoryReadModelRepository) {
        super();
    }

    onUserCreated(event: UserCreated): void {
        this.repository.save(event.userId, {
            name: event.name.toUpperCase(), // "Fixed" bug: now uppercases names
            version: 1
        });
    }

    onUserNameChanged(event: UserNameChanged): void {
        const existing = this.repository.oneOrFail(event.userId);
        this.repository.save(event.userId, {
            name: event.newName.toUpperCase(),
            version: existing.version + 1
        });
    }
}

describe("ProjectionManager", () => {
    let eventStore: InMemoryEventStore;
    let positionStore: InMemoryProjectionPositionStore;
    let projectionManager: ProjectionManager;
    let readModel: InMemoryReadModelRepository;

    beforeEach(() => {
        eventStore = new InMemoryEventStore();
        positionStore = new InMemoryProjectionPositionStore();
        projectionManager = new ProjectionManager(eventStore, positionStore);
        readModel = new InMemoryReadModelRepository();
    });

    describe("rebuild", () => {
        it("should rebuild projection from position 0", async () => {
            // Arrange: Add events to the event store
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'John')),
            ]));
            eventStore.append('user-2', new DomainEventStream([
                DomainMessage.create('user-2', 0, new UserCreated('user-2', 'Jane')),
            ]));
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 1, new UserNameChanged('user-1', 'Johnny')),
            ]));

            const projector = new UserReadModelProjector(readModel);

            // Act: Rebuild the projection
            await projectionManager.rebuild(projector);

            // Assert: Read model should contain all processed data
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'Johnny', version: 2 });
            expect(readModel.oneOrFail('user-2')).toEqual({ name: 'Jane', version: 1 });
        });

        it("should reset position when rebuilding", async () => {
            // Arrange: Set an existing position
            await positionStore.save({
                projectionName: 'UserReadModelProjector',
                lastProcessedPosition: 5,
                lastProcessedAt: new Date(),
            });

            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'John')),
            ]));

            const projector = new UserReadModelProjector(readModel);

            // Act: Rebuild the projection
            await projectionManager.rebuild(projector);

            // Assert: Position should be updated from 0
            const position = await projectionManager.getPosition('UserReadModelProjector');
            expect(position).toBe(1);
        });

        it("should handle empty event store", async () => {
            const projector = new UserReadModelProjector(readModel);

            // Act: Rebuild with no events
            await projectionManager.rebuild(projector);

            // Assert: Position should be 0
            const position = await projectionManager.getPosition('UserReadModelProjector');
            expect(position).toBe(0);
        });
    });

    describe("catchUp", () => {
        it("should process only new events from last position", async () => {
            // Arrange: Add initial events and set position
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'John')),
            ]));

            // Manually set position to simulate previous processing
            await positionStore.save({
                projectionName: 'UserReadModelProjector',
                lastProcessedPosition: 1,
                lastProcessedAt: new Date(),
            });

            // Pre-populate read model as if first event was processed
            readModel.save('user-1', { name: 'John', version: 1 });

            // Add more events after the position
            eventStore.append('user-2', new DomainEventStream([
                DomainMessage.create('user-2', 0, new UserCreated('user-2', 'Jane')),
            ]));
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 1, new UserNameChanged('user-1', 'Johnny')),
            ]));

            const projector = new UserReadModelProjector(readModel);

            // Act: Catch up from last position
            await projectionManager.catchUp(projector);

            // Assert: Both new events should be processed
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'Johnny', version: 2 });
            expect(readModel.oneOrFail('user-2')).toEqual({ name: 'Jane', version: 1 });

            const position = await projectionManager.getPosition('UserReadModelProjector');
            expect(position).toBe(3);
        });

        it("should start from 0 if no previous position exists", async () => {
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'John')),
            ]));

            const projector = new UserReadModelProjector(readModel);

            // Act: Catch up without any previous position
            await projectionManager.catchUp(projector);

            // Assert: Should process from beginning
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'John', version: 1 });
            const position = await projectionManager.getPosition('UserReadModelProjector');
            expect(position).toBe(1);
        });
    });

    describe("getPosition", () => {
        it("should return 0 for unknown projector", async () => {
            const position = await projectionManager.getPosition('UnknownProjector');
            expect(position).toBe(0);
        });

        it("should return stored position", async () => {
            await positionStore.save({
                projectionName: 'TestProjector',
                lastProcessedPosition: 42,
                lastProcessedAt: new Date(),
            });

            const position = await projectionManager.getPosition('TestProjector');
            expect(position).toBe(42);
        });
    });

    describe("position tracking", () => {
        it("should update position after each event", async () => {
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'John')),
            ]));
            eventStore.append('user-2', new DomainEventStream([
                DomainMessage.create('user-2', 0, new UserCreated('user-2', 'Jane')),
            ]));
            eventStore.append('user-3', new DomainEventStream([
                DomainMessage.create('user-3', 0, new UserCreated('user-3', 'Bob')),
            ]));

            const projector = new UserReadModelProjector(readModel);

            await projectionManager.rebuild(projector);

            const finalPosition = await projectionManager.getPosition('UserReadModelProjector');
            expect(finalPosition).toBe(3);
        });

        it("should store lastProcessedAt timestamp", async () => {
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'John')),
            ]));

            const projector = new UserReadModelProjector(readModel);
            const beforeRebuild = new Date();

            await projectionManager.rebuild(projector);

            const storedPosition = await positionStore.get('UserReadModelProjector');
            expect(storedPosition).not.toBeNull();
            expect(storedPosition!.lastProcessedAt.getTime()).toBeGreaterThanOrEqual(beforeRebuild.getTime());
        });
    });

    describe("rebuild after projection bug fix", () => {
        it("should allow rebuilding with fixed projector logic", async () => {
            // Arrange: Add events
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'john')),
            ]));
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 1, new UserNameChanged('user-1', 'johnny')),
            ]));

            // First run with "buggy" projector
            const buggyProjector = new UserReadModelProjector(readModel);
            await projectionManager.rebuild(buggyProjector);

            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'johnny', version: 2 });

            // Simulate clearing read model for rebuild
            const newReadModel = new InMemoryReadModelRepository();
            const fixedProjector = new FixedUserReadModelProjector(newReadModel);

            // Act: Rebuild with fixed projector
            await projectionManager.rebuild(fixedProjector);

            // Assert: New read model should have "fixed" data (uppercase names)
            expect(newReadModel.oneOrFail('user-1')).toEqual({ name: 'JOHNNY', version: 2 });
        });
    });
});

describe("InMemoryProjectionPositionStore", () => {
    let store: InMemoryProjectionPositionStore;

    beforeEach(() => {
        store = new InMemoryProjectionPositionStore();
    });

    it("should return null for unknown projection", async () => {
        const result = await store.get('unknown');
        expect(result).toBeNull();
    });

    it("should save and retrieve position", async () => {
        const position = {
            projectionName: 'TestProjector',
            lastProcessedPosition: 10,
            lastProcessedAt: new Date(),
        };

        await store.save(position);

        const retrieved = await store.get('TestProjector');
        expect(retrieved).toEqual(position);
    });

    it("should reset position", async () => {
        await store.save({
            projectionName: 'TestProjector',
            lastProcessedPosition: 10,
            lastProcessedAt: new Date(),
        });

        await store.reset('TestProjector');

        const result = await store.get('TestProjector');
        expect(result).toBeNull();
    });

    it("should update existing position", async () => {
        await store.save({
            projectionName: 'TestProjector',
            lastProcessedPosition: 5,
            lastProcessedAt: new Date(),
        });

        const newPosition = {
            projectionName: 'TestProjector',
            lastProcessedPosition: 10,
            lastProcessedAt: new Date(),
        };
        await store.save(newPosition);

        const retrieved = await store.get('TestProjector');
        expect(retrieved?.lastProcessedPosition).toBe(10);
    });
});

describe("InMemoryEventStore.loadAll", () => {
    let eventStore: InMemoryEventStore;

    beforeEach(() => {
        eventStore = new InMemoryEventStore();
    });

    it("should yield all events in order", async () => {
        eventStore.append('agg-1', new DomainEventStream([
            DomainMessage.create('agg-1', 0, new UserCreated('agg-1', 'John')),
        ]));
        eventStore.append('agg-2', new DomainEventStream([
            DomainMessage.create('agg-2', 0, new UserCreated('agg-2', 'Jane')),
        ]));

        const events: DomainMessage[] = [];
        for await (const event of eventStore.loadAll()) {
            events.push(event);
        }

        expect(events.length).toBe(2);
        expect(events[0].uuid).toBe('agg-1');
        expect(events[1].uuid).toBe('agg-2');
    });

    it("should yield events from specified position", async () => {
        eventStore.append('agg-1', new DomainEventStream([
            DomainMessage.create('agg-1', 0, new UserCreated('agg-1', 'John')),
        ]));
        eventStore.append('agg-2', new DomainEventStream([
            DomainMessage.create('agg-2', 0, new UserCreated('agg-2', 'Jane')),
        ]));
        eventStore.append('agg-3', new DomainEventStream([
            DomainMessage.create('agg-3', 0, new UserCreated('agg-3', 'Bob')),
        ]));

        const events: DomainMessage[] = [];
        for await (const event of eventStore.loadAll(1)) {
            events.push(event);
        }

        expect(events.length).toBe(2);
        expect(events[0].uuid).toBe('agg-2');
        expect(events[1].uuid).toBe('agg-3');
    });

    it("should yield empty for position beyond events", async () => {
        eventStore.append('agg-1', new DomainEventStream([
            DomainMessage.create('agg-1', 0, new UserCreated('agg-1', 'John')),
        ]));

        const events: DomainMessage[] = [];
        for await (const event of eventStore.loadAll(100)) {
            events.push(event);
        }

        expect(events.length).toBe(0);
    });
});
