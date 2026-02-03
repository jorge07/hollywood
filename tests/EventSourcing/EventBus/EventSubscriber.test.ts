import EventSubscriber from "../../../src/EventSourcing/EventBus/EventSubscriber";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import type DomainEvent from "../../../src/Domain/Event/DomainEvent";

// Test events
class UserCreated implements DomainEvent {
    constructor(public readonly userId: string, public readonly name: string) {}
}

class UserUpdated implements DomainEvent {
    constructor(public readonly userId: string, public readonly newName: string) {}
}

class UserDeleted implements DomainEvent {
    constructor(public readonly userId: string) {}
}

// Subscriber using new explicit handler registration pattern
class ExplicitHandlerSubscriber extends EventSubscriber {
    public createdEvents: UserCreated[] = [];
    public updatedEvents: UserUpdated[] = [];
    public handlerCallOrder: string[] = [];

    constructor() {
        super();
        this.registerHandler(UserCreated, this.handleUserCreated.bind(this));
        this.registerHandler(UserUpdated, this.handleUserUpdated.bind(this));
    }

    private handleUserCreated(event: UserCreated): void {
        this.createdEvents.push(event);
        this.handlerCallOrder.push("UserCreated");
    }

    private handleUserUpdated(event: UserUpdated): void {
        this.updatedEvents.push(event);
        this.handlerCallOrder.push("UserUpdated");
    }
}

// Subscriber using async handlers
class AsyncHandlerSubscriber extends EventSubscriber {
    public processedEvents: DomainEvent[] = [];
    public processingDelay: number = 10;

    constructor() {
        super();
        this.registerHandler(UserCreated, this.handleUserCreatedAsync.bind(this));
    }

    private async handleUserCreatedAsync(event: UserCreated): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, this.processingDelay));
        this.processedEvents.push(event);
    }
}

// Legacy subscriber using on{EventType} method pattern (backwards compatibility)
class LegacySubscriber extends EventSubscriber {
    public createdEvents: UserCreated[] = [];
    public updatedEvents: UserUpdated[] = [];

    protected onUserCreated(event: UserCreated): void {
        this.createdEvents.push(event);
    }

    protected onUserUpdated(event: UserUpdated): void {
        this.updatedEvents.push(event);
    }
}

// Mixed subscriber: uses explicit handlers for some events, legacy for others
class MixedSubscriber extends EventSubscriber {
    public explicitHandledEvents: UserCreated[] = [];
    public legacyHandledEvents: UserUpdated[] = [];

    constructor() {
        super();
        // Only register explicit handler for UserCreated
        this.registerHandler(UserCreated, this.handleUserCreated.bind(this));
    }

    private handleUserCreated(event: UserCreated): void {
        this.explicitHandledEvents.push(event);
    }

    // Legacy handler for UserUpdated
    protected onUserUpdated(event: UserUpdated): void {
        this.legacyHandledEvents.push(event);
    }
}

describe("EventSubscriber", () => {
    describe("Explicit handler registration", () => {
        it("should route events to registered handlers", async () => {
            const subscriber = new ExplicitHandlerSubscriber();

            const createdMessage = DomainMessage.create(
                "user-1",
                0,
                new UserCreated("user-1", "John")
            );

            await subscriber.on(createdMessage);

            expect(subscriber.createdEvents.length).toBe(1);
            expect(subscriber.createdEvents[0].userId).toBe("user-1");
            expect(subscriber.createdEvents[0].name).toBe("John");
        });

        it("should handle multiple event types correctly", async () => {
            const subscriber = new ExplicitHandlerSubscriber();

            const createdMessage = DomainMessage.create(
                "user-1",
                0,
                new UserCreated("user-1", "John")
            );
            const updatedMessage = DomainMessage.create(
                "user-1",
                1,
                new UserUpdated("user-1", "Jane")
            );

            await subscriber.on(createdMessage);
            await subscriber.on(updatedMessage);

            expect(subscriber.createdEvents.length).toBe(1);
            expect(subscriber.updatedEvents.length).toBe(1);
            expect(subscriber.handlerCallOrder).toEqual(["UserCreated", "UserUpdated"]);
        });

        it("should silently ignore unhandled event types", async () => {
            const subscriber = new ExplicitHandlerSubscriber();

            const deletedMessage = DomainMessage.create(
                "user-1",
                0,
                new UserDeleted("user-1")
            );

            // Should not throw
            await expect(subscriber.on(deletedMessage)).resolves.toBeUndefined();
            expect(subscriber.createdEvents.length).toBe(0);
            expect(subscriber.updatedEvents.length).toBe(0);
        });

        it("should support async handlers", async () => {
            const subscriber = new AsyncHandlerSubscriber();

            const createdMessage = DomainMessage.create(
                "user-1",
                0,
                new UserCreated("user-1", "John")
            );

            await subscriber.on(createdMessage);

            expect(subscriber.processedEvents.length).toBe(1);
        });
    });

    describe("Backwards compatibility with legacy on{EventType} pattern", () => {
        it("should route events to on{EventType} methods", async () => {
            const subscriber = new LegacySubscriber();

            const createdMessage = DomainMessage.create(
                "user-1",
                0,
                new UserCreated("user-1", "John")
            );

            await subscriber.on(createdMessage);

            expect(subscriber.createdEvents.length).toBe(1);
            expect(subscriber.createdEvents[0].userId).toBe("user-1");
        });

        it("should handle multiple event types via legacy methods", async () => {
            const subscriber = new LegacySubscriber();

            const createdMessage = DomainMessage.create(
                "user-1",
                0,
                new UserCreated("user-1", "John")
            );
            const updatedMessage = DomainMessage.create(
                "user-1",
                1,
                new UserUpdated("user-1", "Jane")
            );

            await subscriber.on(createdMessage);
            await subscriber.on(updatedMessage);

            expect(subscriber.createdEvents.length).toBe(1);
            expect(subscriber.updatedEvents.length).toBe(1);
        });

        it("should silently ignore unhandled events in legacy mode", async () => {
            const subscriber = new LegacySubscriber();

            const deletedMessage = DomainMessage.create(
                "user-1",
                0,
                new UserDeleted("user-1")
            );

            // Should not throw
            await expect(subscriber.on(deletedMessage)).resolves.toBeUndefined();
        });
    });

    describe("Mixed explicit and legacy handlers", () => {
        it("should prefer explicit handlers over legacy methods", async () => {
            const subscriber = new MixedSubscriber();

            const createdMessage = DomainMessage.create(
                "user-1",
                0,
                new UserCreated("user-1", "John")
            );
            const updatedMessage = DomainMessage.create(
                "user-1",
                1,
                new UserUpdated("user-1", "Jane")
            );

            await subscriber.on(createdMessage);
            await subscriber.on(updatedMessage);

            expect(subscriber.explicitHandledEvents.length).toBe(1);
            expect(subscriber.legacyHandledEvents.length).toBe(1);
        });
    });

    describe("Handler registration", () => {
        it("should allow overwriting handlers for the same event type", async () => {
            class OverwritingSubscriber extends EventSubscriber {
                public callCount = 0;

                constructor() {
                    super();
                    this.registerHandler(UserCreated, () => { this.callCount += 1; });
                    // Overwrite with new handler
                    this.registerHandler(UserCreated, () => { this.callCount += 10; });
                }
            }

            const subscriber = new OverwritingSubscriber();
            const message = DomainMessage.create(
                "user-1",
                0,
                new UserCreated("user-1", "John")
            );

            await subscriber.on(message);

            // Only the second handler should be called
            expect(subscriber.callCount).toBe(10);
        });
    });
});
