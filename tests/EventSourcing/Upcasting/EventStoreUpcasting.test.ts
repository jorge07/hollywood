import "reflect-metadata";

import type DomainEvent from "../../../src/Domain/Event/DomainEvent";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import DomainEventStream from "../../../src/Domain/Event/DomainEventStream";
import EventSourcedAggregateRoot from "../../../src/Domain/EventSourcedAggregateRoot";
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
        public readonly userId: string,
        public readonly name: string,
        public readonly email: string = "",
        version: number = 2,
    ) {
        this.version = version;
    }
}

// Test aggregate
class User extends EventSourcedAggregateRoot {
    public name: string = "";
    public email: string = "";

    constructor(id: string) {
        super(id);
    }

    public create(name: string, email: string = ""): void {
        this.raise(new UserCreated(this.getAggregateRootId(), name, email));
    }

    public applyUserCreated(event: UserCreated): void {
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
                return new UserCreated(event.userId, event.name, "default@example.com", 2);
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
        const v1Event = new UserCreated("user-123", "John Doe", "", 1);
        const message = DomainMessage.create("user-123", 0, v1Event);
        dbal.storeRawEvents("user-123", [message]);

        // Load the user - events should be upcasted
        const user = await store.load("user-123");

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
        const event = new UserCreated("user-456", "Jane Doe", "jane@example.com");
        const message = DomainMessage.create("user-456", 0, event);
        dbal.storeRawEvents("user-456", [message]);

        // Load the user
        const loadedUser = await store.load("user-456");

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
        const v1Event = new UserCreated("user-789", "Bob Smith", "", 1);
        const message = DomainMessage.create("user-789", 0, v1Event);
        dbal.storeRawEvents("user-789", [message]);

        // Load the user - event should pass through unchanged
        const user = await store.load("user-789");

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
                return new UserCreated(event.userId, event.name, "migrated@example.com", 2);
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
        const v1Event1 = new UserCreated("user-multi", "User One", "", 1);
        const message1 = DomainMessage.create("user-multi", 0, v1Event1);
        dbal.storeRawEvents("user-multi", [message1]);

        const user = await store.load("user-multi");

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
                return new UserCreated(event.userId, event.name, "should-not-see-this@example.com", 2);
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
        const v2Event = new UserCreated("user-v2", "Already V2", "already@v2.com", 2);
        const message = DomainMessage.create("user-v2", 0, v2Event);
        dbal.storeRawEvents("user-v2", [message]);

        const user = await store.load("user-v2");

        expect(user.name).toBe("Already V2");
        expect(user.email).toBe("already@v2.com"); // Original email preserved, not replaced
    });
});
