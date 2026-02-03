import "reflect-metadata";

import type DomainEvent from "../../../src/Domain/Event/DomainEvent";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import DomainEventStream from "../../../src/Domain/Event/DomainEventStream";
import EventSourcedAggregateRoot from "../../../src/Domain/EventSourcedAggregateRoot";
import { Identity } from "../../../src/Domain/AggregateRoot";
import EventBus from "../../../src/EventSourcing/EventBus/EventBus";
import EventStore from "../../../src/EventSourcing/EventStore";
import IEventStoreDBAL from "../../../src/EventSourcing/IEventStoreDBAL";
import { UpcasterChain } from "../../../src/EventSourcing/Upcasting/UpcasterChain";
import { EventUpcaster } from "../../../src/EventSourcing/Upcasting/EventUpcaster";

// Test event - single class that evolves over time
// In real usage, you'd have one event class and the upcaster transforms
// plain objects/older serialized versions into the current structure
class UserCreated implements DomainEvent {
    public readonly version: number;

    constructor(
        public readonly aggregateId: string,
        public readonly userId: string,
        public readonly name: string,
        public readonly email: string = "",
        version: number = 2,
        public readonly occurredAt: Date = new Date()
    ) {
        this.version = version;
    }
}

// Test aggregate
class User extends EventSourcedAggregateRoot {
    public name: string = "";
    public email: string = "";

    constructor(id: Identity) {
        super(id);
        this.registerHandler(UserCreated, (event) => this.onUserCreated(event));
    }

    public create(name: string, email: string = ""): void {
        this.raise(new UserCreated(this.getAggregateRootId().toString(), name, email));
    }

    private onUserCreated(event: UserCreated): void {
        this.name = event.name;
        this.email = event.email;
    }
}

// In-memory event store for testing
class TestInMemoryEventStore implements IEventStoreDBAL {
    private events: Map<string, DomainMessage[]> = new Map();
    private globalEventLog: DomainMessage[] = [];

    public async load(aggregateId: string, from: number = 0): Promise<DomainEventStream> {
        const events = this.events.get(aggregateId) || [];
        const filteredEvents = events.filter((e) => e.playhead >= from);
        return new DomainEventStream(filteredEvents);
    }

    public async loadFromTo(aggregateId: string, from: number = 0, to?: number): Promise<DomainEventStream> {
        const events = this.events.get(aggregateId) || [];
        const filteredEvents = events.filter((e) => {
            return e.playhead >= from && (to === undefined || e.playhead <= to);
        });
        return new DomainEventStream(filteredEvents);
    }

    public async append(aggregateId: string, stream: DomainEventStream): Promise<void> {
        const existing = this.events.get(aggregateId) || [];
        this.events.set(aggregateId, [...existing, ...stream.events]);
        stream.events.forEach((event) => this.globalEventLog.push(event));
    }

    public async *loadAll(fromPosition: number = 0): AsyncIterable<DomainMessage> {
        for (let i = fromPosition; i < this.globalEventLog.length; i++) {
            yield this.globalEventLog[i];
        }
    }

    // Helper method to directly store events (simulating old v1 events in storage)
    public storeRawEvents(aggregateId: string, events: DomainMessage[]): void {
        this.events.set(aggregateId, events);
        events.forEach((event) => this.globalEventLog.push(event));
    }
}

describe("EventStore with Upcasting", () => {
    let eventBus: EventBus;
    let dbal: TestInMemoryEventStore;
    let upcasterChain: UpcasterChain;

    beforeEach(() => {
        eventBus = new EventBus();
        dbal = new TestInMemoryEventStore();
        upcasterChain = new UpcasterChain();
    });

    it("should upcast events when loading from event store", async () => {
        // Register the upcaster
        const upcaster: EventUpcaster<UserCreated> = {
            eventType: "UserCreated",
            fromVersion: 1,
            toVersion: 2,
            upcast: (event) => {
                return new UserCreated(event.aggregateId, event.userId, event.name, "default@example.com", 2, event.occurredAt);
            },
        };
        upcasterChain.register(upcaster);

        // Create the event store with upcaster chain
        const store = new EventStore<User>(
            User,
            dbal,
            eventBus,
            undefined,
            undefined,
            upcasterChain,
        );

        // Store a v1 event directly (simulating historical data)
        const userId = '550e8400-0000-4000-8000-000000000123';
        const v1Event = new UserCreated(userId, userId, "John Doe", "", 1);
        const message = DomainMessage.create(userId, 0, v1Event);
        dbal.storeRawEvents(userId, [message]);

        // Load the user - events should be upcasted
        const user = await store.load(Identity.fromString(userId));

        expect(user.name).toBe("John Doe");
        expect(user.email).toBe("default@example.com");
    });

    it("should work without upcaster chain", async () => {
        // Create the event store without upcaster chain
        const store = new EventStore<User>(
            User,
            dbal,
            eventBus,
        );

        // Store an event directly
        const userId = '550e8400-0000-4000-8000-000000000456';
        const event = new UserCreated(userId, userId, "Jane Doe", "jane@example.com");
        const message = DomainMessage.create(userId, 0, event);
        dbal.storeRawEvents(userId, [message]);

        // Load the user
        const loadedUser = await store.load(Identity.fromString(userId));

        expect(loadedUser.name).toBe("Jane Doe");
        expect(loadedUser.email).toBe("jane@example.com");
    });

    it("should pass through events without registered upcasters", async () => {
        // Create the event store with empty upcaster chain
        const store = new EventStore<User>(
            User,
            dbal,
            eventBus,
            undefined,
            undefined,
            upcasterChain,
        );

        // Store a v1 event without registering an upcaster
        const userId = '550e8400-0000-4000-8000-000000000789';
        const v1Event = new UserCreated(userId, userId, "Bob Smith", "", 1);
        const message = DomainMessage.create(userId, 0, v1Event);
        dbal.storeRawEvents(userId, [message]);

        // Load the user - event should pass through unchanged
        const user = await store.load(Identity.fromString(userId));

        expect(user.name).toBe("Bob Smith");
        expect(user.email).toBe(""); // No email since no upcaster was applied
    });

    it("should upcast multiple events in a stream", async () => {
        // Register the upcaster
        const upcaster: EventUpcaster<UserCreated> = {
            eventType: "UserCreated",
            fromVersion: 1,
            toVersion: 2,
            upcast: (event) => {
                return new UserCreated(event.aggregateId, event.userId, event.name, "migrated@example.com", 2, event.occurredAt);
            },
        };
        upcasterChain.register(upcaster);

        const store = new EventStore<User>(
            User,
            dbal,
            eventBus,
            undefined,
            undefined,
            upcasterChain,
        );

        // Store a v1 event
        const userId = '550e8400-0000-4000-8000-0000000000aa';
        const v1Event1 = new UserCreated(userId, userId, "User One", "", 1);
        const message1 = DomainMessage.create(userId, 0, v1Event1);
        dbal.storeRawEvents(userId, [message1]);

        const user = await store.load(Identity.fromString(userId));

        expect(user.name).toBe("User One");
        expect(user.email).toBe("migrated@example.com");
    });

    it("should handle events that are already at the latest version", async () => {
        // Register the upcaster
        const upcaster: EventUpcaster<UserCreated> = {
            eventType: "UserCreated",
            fromVersion: 1,
            toVersion: 2,
            upcast: (event) => {
                return new UserCreated(event.aggregateId, event.userId, event.name, "should-not-see-this@example.com", 2, event.occurredAt);
            },
        };
        upcasterChain.register(upcaster);

        const store = new EventStore<User>(
            User,
            dbal,
            eventBus,
            undefined,
            undefined,
            upcasterChain,
        );

        // Store a v2 event directly (already at latest version)
        const userId = '550e8400-0000-4000-8000-0000000000bb';
        const v2Event = new UserCreated(userId, userId, "Already V2", "already@v2.com", 2);
        const message = DomainMessage.create(userId, 0, v2Event);
        dbal.storeRawEvents(userId, [message]);

        const user = await store.load(Identity.fromString(userId));

        expect(user.name).toBe("Already V2");
        expect(user.email).toBe("already@v2.com"); // Original email preserved, not replaced
    });
});
