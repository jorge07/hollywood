import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import EventListener from "../../../src/EventSourcing/EventBus/EventListener";
import EventSubscriber from "../../../src/EventSourcing/EventBus/EventSubscriber";
import IdempotentEventBus from "../../../src/EventSourcing/Idempotency/IdempotentEventBus";
import InMemoryIdempotencyStore from "../../../src/EventSourcing/Idempotency/InMemoryIdempotencyStore";

class TestEvent {
    constructor(public readonly value: string) {}
}

class AnotherEvent {
    constructor(public readonly data: number) {}
}

class TestEventSubscriber extends EventSubscriber {
    public callCount: number = 0;
    public events: TestEvent[] = [];

    protected onTestEvent(event: TestEvent): void {
        this.callCount++;
        this.events.push(event);
    }
}

class TestEventListener extends EventListener {
    public callCount: number = 0;
    public messages: DomainMessage[] = [];

    public async on(message: DomainMessage): Promise<void> {
        this.callCount++;
        this.messages.push(message);
    }
}

class FailingListener extends EventListener {
    public callCount: number = 0;

    public async on(message: DomainMessage): Promise<void> {
        this.callCount++;
        throw new Error("Listener failed");
    }
}

describe("IdempotentEventBus", () => {
    let store: InMemoryIdempotencyStore;
    let eventBus: IdempotentEventBus;

    beforeEach(() => {
        store = new InMemoryIdempotencyStore(0);
        eventBus = new IdempotentEventBus(store);
    });

    afterEach(() => {
        store.stopCleanup();
        store.clear();
    });

    describe("duplicate prevention", () => {
        it("should publish event on first call", async () => {
            const subscriber = new TestEventSubscriber();
            eventBus.attach(TestEvent, subscriber);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));
            await eventBus.publish(message);

            expect(subscriber.callCount).toBe(1);
        });

        it("should prevent duplicate event publishing", async () => {
            const subscriber = new TestEventSubscriber();
            eventBus.attach(TestEvent, subscriber);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await eventBus.publish(message);
            await eventBus.publish(message);
            await eventBus.publish(message);

            expect(subscriber.callCount).toBe(1);
        });

        it("should allow different events", async () => {
            const listener = new TestEventListener();
            eventBus.addListener(listener);

            const message1 = DomainMessage.create("123", 0, new TestEvent("test1"));
            const message2 = DomainMessage.create("123", 1, new TestEvent("test2"));

            await eventBus.publish(message1);
            await eventBus.publish(message2);

            expect(listener.callCount).toBe(2);
        });

        it("should notify both subscribers and listeners", async () => {
            const subscriber = new TestEventSubscriber();
            const listener = new TestEventListener();

            eventBus.attach(TestEvent, subscriber);
            eventBus.addListener(listener);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));
            await eventBus.publish(message);

            expect(subscriber.callCount).toBe(1);
            expect(listener.callCount).toBe(1);
        });
    });

    describe("onDuplicate callback", () => {
        it("should call onDuplicate when duplicate detected", async () => {
            const duplicates: DomainMessage[] = [];
            const busWithCallback = new IdempotentEventBus(store, {
                onDuplicate: (msg) => duplicates.push(msg),
            });

            const subscriber = new TestEventSubscriber();
            busWithCallback.attach(TestEvent, subscriber);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await busWithCallback.publish(message);
            await busWithCallback.publish(message);

            expect(duplicates.length).toBe(1);
            expect(duplicates[0]).toBe(message);
            expect(subscriber.callCount).toBe(1);
        });
    });

    describe("TTL support", () => {
        it("should allow reprocessing after TTL expires", async () => {
            const busWithTTL = new IdempotentEventBus(store, { ttl: 50 });
            const subscriber = new TestEventSubscriber();
            busWithTTL.attach(TestEvent, subscriber);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await busWithTTL.publish(message);
            expect(subscriber.callCount).toBe(1);

            // Wait for TTL to expire
            await new Promise((resolve) => setTimeout(resolve, 100));

            await busWithTTL.publish(message);
            expect(subscriber.callCount).toBe(2);
        });
    });

    describe("error handling", () => {
        it("should remove idempotency key when publishing fails", async () => {
            const failingListener = new FailingListener();
            eventBus.addListener(failingListener);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await expect(eventBus.publish(message)).rejects.toThrow("Listener failed");

            // Key should be removed to allow retry
            expect(await store.exists(message.idempotencyKey)).toBe(false);
        });

        it("should allow retry after failure", async () => {
            let shouldFail = true;
            const conditionalListener = new (class extends EventListener {
                public callCount = 0;
                public async on(message: DomainMessage): Promise<void> {
                    this.callCount++;
                    if (shouldFail) {
                        throw new Error("Temporary failure");
                    }
                }
            })();

            eventBus.addListener(conditionalListener);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            // First attempt fails
            await expect(eventBus.publish(message)).rejects.toThrow("Temporary failure");
            expect(conditionalListener.callCount).toBe(1);

            // Second attempt succeeds
            shouldFail = false;
            await eventBus.publish(message);
            expect(conditionalListener.callCount).toBe(2);
        });
    });

    describe("sequential handling", () => {
        it("should handle sequential publish attempts correctly", async () => {
            const listener = new TestEventListener();
            eventBus.addListener(listener);

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            // Sequential publishing - idempotency works correctly
            await eventBus.publish(message);
            await eventBus.publish(message);
            await eventBus.publish(message);

            // Only the first one should be processed
            expect(listener.callCount).toBe(1);
        });

        it("should handle multiple different events in sequence", async () => {
            const listener = new TestEventListener();
            eventBus.addListener(listener);

            const messages = [
                DomainMessage.create("123", 0, new TestEvent("test1")),
                DomainMessage.create("123", 1, new TestEvent("test2")),
                DomainMessage.create("123", 2, new TestEvent("test3")),
            ];

            for (const message of messages) {
                await eventBus.publish(message);
            }

            expect(listener.callCount).toBe(3);
        });
    });

    describe("chaining", () => {
        it("should return self from attach for chaining", () => {
            const subscriber1 = new TestEventSubscriber();
            const subscriber2 = new TestEventSubscriber();

            const result = eventBus
                .attach(TestEvent, subscriber1)
                .attach(AnotherEvent, subscriber2);

            expect(result).toBe(eventBus);
        });

        it("should return self from addListener for chaining", () => {
            const listener1 = new TestEventListener();
            const listener2 = new TestEventListener();

            const result = eventBus
                .addListener(listener1)
                .addListener(listener2);

            expect(result).toBe(eventBus);
        });
    });
});
