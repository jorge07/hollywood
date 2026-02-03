import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import EventListener from "../../../src/EventSourcing/EventBus/EventListener";
import IdempotentHandler, { makeIdempotent } from "../../../src/EventSourcing/Idempotency/IdempotentHandler";
import InMemoryIdempotencyStore from "../../../src/EventSourcing/Idempotency/InMemoryIdempotencyStore";

class TestEvent {
    constructor(public readonly value: string) {}
}

class TestEventListener extends EventListener {
    public callCount: number = 0;
    public lastMessage: DomainMessage | null = null;

    public async on(message: DomainMessage): Promise<void> {
        this.callCount++;
        this.lastMessage = message;
    }
}

class FailingEventListener extends EventListener {
    public callCount: number = 0;

    public async on(message: DomainMessage): Promise<void> {
        this.callCount++;
        throw new Error("Handler failed");
    }
}

describe("IdempotentHandler", () => {
    let store: InMemoryIdempotencyStore;
    let innerHandler: TestEventListener;
    let handler: IdempotentHandler;

    beforeEach(() => {
        store = new InMemoryIdempotencyStore(0);
        innerHandler = new TestEventListener();
        handler = new IdempotentHandler(innerHandler, store);
    });

    afterEach(() => {
        store.stopCleanup();
        store.clear();
    });

    describe("duplicate detection", () => {
        it("should process event on first call", async () => {
            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await handler.on(message);

            expect(innerHandler.callCount).toBe(1);
            expect(innerHandler.lastMessage).toBe(message);
        });

        it("should skip processing on duplicate event", async () => {
            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await handler.on(message);
            await handler.on(message);
            await handler.on(message);

            expect(innerHandler.callCount).toBe(1);
        });

        it("should process different events", async () => {
            const message1 = DomainMessage.create("123", 0, new TestEvent("test1"));
            const message2 = DomainMessage.create("123", 1, new TestEvent("test2"));

            await handler.on(message1);
            await handler.on(message2);

            expect(innerHandler.callCount).toBe(2);
        });

        it("should use idempotencyKey from message", async () => {
            const message1 = DomainMessage.create("123", 0, new TestEvent("test"), [], undefined, "custom-key-1");
            const message2 = DomainMessage.create("456", 0, new TestEvent("test"), [], undefined, "custom-key-1");

            await handler.on(message1);
            await handler.on(message2); // Same custom key

            expect(innerHandler.callCount).toBe(1);
        });
    });

    describe("onDuplicate callback", () => {
        it("should call onDuplicate when duplicate detected", async () => {
            const duplicates: DomainMessage[] = [];
            const handlerWithCallback = new IdempotentHandler(
                innerHandler,
                store,
                { onDuplicate: (msg) => duplicates.push(msg) }
            );

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await handlerWithCallback.on(message);
            await handlerWithCallback.on(message);
            await handlerWithCallback.on(message);

            expect(duplicates.length).toBe(2);
            expect(duplicates[0]).toBe(message);
        });
    });

    describe("TTL support", () => {
        it("should mark with TTL when specified", async () => {
            const handlerWithTTL = new IdempotentHandler(
                innerHandler,
                store,
                { ttl: 50 }
            );

            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await handlerWithTTL.on(message);
            expect(innerHandler.callCount).toBe(1);

            // Wait for TTL to expire
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Should process again after TTL expires
            await handlerWithTTL.on(message);
            expect(innerHandler.callCount).toBe(2);
        });
    });

    describe("error handling", () => {
        it("should re-throw error by default", async () => {
            const failingHandler = new FailingEventListener();
            const idempotentHandler = new IdempotentHandler(failingHandler, store);
            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await expect(idempotentHandler.on(message)).rejects.toThrow("Handler failed");
        });

        it("should not mark as processed when handler fails", async () => {
            const failingHandler = new FailingEventListener();
            const idempotentHandler = new IdempotentHandler(failingHandler, store);
            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            try {
                await idempotentHandler.on(message);
            } catch (e) {
                // Expected
            }

            // Key should not be marked
            expect(await store.exists(message.idempotencyKey)).toBe(false);
        });

        it("should call onError callback when provided", async () => {
            const errors: Array<{ error: Error; message: DomainMessage }> = [];
            const failingHandler = new FailingEventListener();
            const idempotentHandler = new IdempotentHandler(
                failingHandler,
                store,
                {
                    onError: (error, msg) => errors.push({ error, message: msg }),
                }
            );
            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            await idempotentHandler.on(message); // Should not throw

            expect(errors.length).toBe(1);
            expect(errors[0].error.message).toBe("Handler failed");
            expect(errors[0].message).toBe(message);
        });
    });
});

describe("makeIdempotent", () => {
    it("should create an IdempotentHandler", async () => {
        const store = new InMemoryIdempotencyStore(0);
        const innerHandler = new TestEventListener();

        const handler = makeIdempotent(innerHandler, store, { ttl: 1000 });

        expect(handler).toBeInstanceOf(IdempotentHandler);

        const message = DomainMessage.create("123", 0, new TestEvent("test"));
        await handler.on(message);

        expect(innerHandler.callCount).toBe(1);

        store.stopCleanup();
    });
});
