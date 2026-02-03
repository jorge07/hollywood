import InMemoryEventStore from '../../src/EventSourcing/InMemoryEventStore';
import DomainMessage from '../../src/Domain/Event/DomainMessage';
import DomainEventStream from '../../src/Domain/Event/DomainEventStream';
import type DomainEvent from '../../src/Domain/Event/DomainEvent';
import InMemoryReadModelRepository from '../../src/ReadModel/InMemoryReadModelRepository';
import InMemoryProjectionPositionStore from '../../src/ReadModel/InMemoryProjectionPositionStore';
import ProjectionManager from '../../src/ReadModel/ProjectionManager';
import EventSubscriber from '../../src/EventSourcing/EventBus/EventSubscriber';

class UserCreated implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly userId: string,
        public readonly name: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

class UserNameChanged implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly userId: string,
        public readonly newName: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

class UserReadModelProjector extends EventSubscriber {
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
class FixedUserReadModelProjector extends EventSubscriber {
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
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'user-1', 'John')),
            ]));

            eventStore.append('user-2', new DomainEventStream([
                DomainMessage.create('user-2', 0, new UserCreated('user-2', 'user-2', 'Jane')),
            ]));

            // Act: Rebuild projection
            const projector = new UserReadModelProjector(readModel);
            await projectionManager.rebuild(projector);

            // Assert: Read model should contain all users
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'John', version: 1 });
            expect(readModel.oneOrFail('user-2')).toEqual({ name: 'Jane', version: 1 });
        });

        it("should process events in order", async () => {
            // Arrange: Add a create and an update event
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'user-1', 'John')),
            ]));

            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 1, new UserNameChanged('user-1', 'user-1', 'Johnny')),
            ]));

            // Act
            const projector = new UserReadModelProjector(readModel);
            await projectionManager.rebuild(projector);

            // Assert
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'Johnny', version: 2 });
        });

        it("should reset position to 0 before rebuilding", async () => {
            // Arrange: Set an initial position
            await positionStore.save({
                projectionName: 'UserReadModelProjector',
                lastProcessedPosition: 100,
                lastProcessedAt: new Date()
            });

            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'user-1', 'John')),
            ]));

            // Act
            const projector = new UserReadModelProjector(readModel);
            await projectionManager.rebuild(projector);

            // Assert: Position should be 1 (one event processed from 0)
            const position = await projectionManager.getPosition('UserReadModelProjector');
            expect(position).toBe(1);
        });
    });

    describe("catchUp", () => {
        it("should catch up from last processed position", async () => {
            // Arrange: Add events
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'user-1', 'John')),
            ]));

            eventStore.append('user-2', new DomainEventStream([
                DomainMessage.create('user-2', 0, new UserCreated('user-2', 'user-2', 'Jane')),
            ]));

            // Simulate projector already processed first event
            await positionStore.save({
                projectionName: 'UserReadModelProjector',
                lastProcessedPosition: 1,
                lastProcessedAt: new Date()
            });

            // Pre-populate read model with first user (as if already projected)
            readModel.save('user-1', { name: 'John', version: 1 });

            // Act
            const projector = new UserReadModelProjector(readModel);
            await projectionManager.catchUp(projector);

            // Assert: Only second user should be added
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'John', version: 1 });
            expect(readModel.oneOrFail('user-2')).toEqual({ name: 'Jane', version: 1 });
        });

        it("should start from 0 if no position exists", async () => {
            // Arrange
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'user-1', 'John')),
            ]));

            // Act
            const projector = new UserReadModelProjector(readModel);
            await projectionManager.catchUp(projector);

            // Assert
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'John', version: 1 });
        });
    });

    describe("getPosition", () => {
        it("should return 0 for unknown projector", async () => {
            const position = await projectionManager.getPosition('UnknownProjector');
            expect(position).toBe(0);
        });

        it("should return last processed position", async () => {
            await positionStore.save({
                projectionName: 'TestProjector',
                lastProcessedPosition: 42,
                lastProcessedAt: new Date()
            });

            const position = await projectionManager.getPosition('TestProjector');
            expect(position).toBe(42);
        });
    });

    describe("projection rebuild scenarios", () => {
        it("should allow rebuilding a projection after a bug fix", async () => {
            // Arrange: Add events
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'user-1', 'john')),
            ]));

            // First build with "buggy" projector
            const buggyProjector = new UserReadModelProjector(readModel);
            await projectionManager.rebuild(buggyProjector);
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'john', version: 1 });

            // Clear read model
            readModel = new InMemoryReadModelRepository();

            // Rebuild with "fixed" projector
            const fixedProjector = new FixedUserReadModelProjector(readModel);
            await projectionManager.rebuild(fixedProjector);

            // Assert: Name should now be uppercased
            expect(readModel.oneOrFail('user-1')).toEqual({ name: 'JOHN', version: 1 });
        });

        it("should update position after each event", async () => {
            // Arrange
            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 0, new UserCreated('user-1', 'user-1', 'John')),
            ]));

            eventStore.append('user-1', new DomainEventStream([
                DomainMessage.create('user-1', 1, new UserNameChanged('user-1', 'user-1', 'Johnny')),
            ]));

            // Act
            const projector = new UserReadModelProjector(readModel);
            await projectionManager.rebuild(projector);

            // Assert: Position should be 2 (two events processed)
            const position = await projectionManager.getPosition('UserReadModelProjector');
            expect(position).toBe(2);
        });
    });
});
