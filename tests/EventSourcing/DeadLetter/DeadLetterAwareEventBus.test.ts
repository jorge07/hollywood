import "reflect-metadata";

import DeadLetterAwareEventBus from "../../../src/EventSourcing/DeadLetter/DeadLetterAwareEventBus";
import InMemoryDeadLetterQueue from "../../../src/EventSourcing/DeadLetter/InMemoryDeadLetterQueue";
import RetryPolicy from "../../../src/EventSourcing/DeadLetter/RetryPolicy";
import EventSubscriber from "../../../src/EventSourcing/EventBus/EventSubscriber";
import EventListener from "../../../src/EventSourcing/EventBus/EventListener";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import type DomainEvent from "../../../src/Domain/Event/DomainEvent";

class TestEvent implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly data: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

class FailingEvent implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly data: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

class SuccessfulSubscriber extends EventSubscriber {
    public processedEvents: TestEvent[] = [];

    protected onTestEvent(event: TestEvent): void {
        this.processedEvents.push(event);
    }
}

class FailingSubscriber extends EventSubscriber {
    public attemptCount: number = 0;

    protected onFailingEvent(event: FailingEvent): void {
        this.attemptCount++;
        throw new Error("Handler failed!");
    }
}

class FailingThenSuccessSubscriber extends EventSubscriber {
    public attemptCount: number = 0;
    public failUntilAttempt: number = 2;
    public processedEvents: FailingEvent[] = [];

    protected onFailingEvent(event: FailingEvent): void {
        this.attemptCount++;
        if (this.attemptCount < this.failUntilAttempt) {
            throw new Error(`Handler failed on attempt ${this.attemptCount}!`);
        }
        this.processedEvents.push(event);
    }
}

class SuccessfulListener extends EventListener {
    public processedMessages: DomainMessage[] = [];

    public on(message: DomainMessage): void {
        this.processedMessages.push(message);
    }
}

class FailingListener extends EventListener {
    public attemptCount: number = 0;

    public on(message: DomainMessage): void {
        this.attemptCount++;
        throw new Error("Listener failed!");
    }
}

describe("DeadLetterAwareEventBus", () => {
    let dlq: InMemoryDeadLetterQueue;

    beforeEach(() => {
        dlq = new InMemoryDeadLetterQueue();
    });

    describe("publish - without retry policy", () => {
        it("should process events normally when handlers succeed", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const subscriber = new SuccessfulSubscriber();

            eventBus.attach(TestEvent, subscriber);

            const message = DomainMessage.create("test-uuid", 1, new TestEvent("test-uuid", "test-data"));
            await eventBus.publish(message);

            expect(subscriber.processedEvents.length).toBe(1);
            expect(subscriber.processedEvents[0].data).toBe("test-data");
            expect(await dlq.count()).toBe(0);
        });

        it("should send to DLQ when subscriber fails", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const failingSubscriber = new FailingSubscriber();

            eventBus.attach(FailingEvent, failingSubscriber);

            const message = DomainMessage.create("test-uuid", 1, new FailingEvent("test-uuid", "fail-data"));
            await eventBus.publish(message);

            expect(failingSubscriber.attemptCount).toBe(1);
            expect(await dlq.count()).toBe(1);

            const dlqMessages = await dlq.getAll();
            expect(dlqMessages[0].handlerName).toBe("FailingSubscriber");
            expect(dlqMessages[0].error.message).toBe("Handler failed!");
            expect(dlqMessages[0].retryCount).toBe(0);
        });

        it("should send to DLQ when listener fails", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const failingListener = new FailingListener();

            eventBus.addListener(failingListener);

            const message = DomainMessage.create("test-uuid", 1, new TestEvent("test-uuid", "test-data"));
            await eventBus.publish(message);

            expect(failingListener.attemptCount).toBe(1);
            expect(await dlq.count()).toBe(1);

            const dlqMessages = await dlq.getAll();
            expect(dlqMessages[0].handlerName).toBe("FailingListener");
        });

        it("should continue processing other handlers when one fails", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const successfulListener = new SuccessfulListener();
            const failingListener = new FailingListener();

            eventBus.addListener(failingListener);
            eventBus.addListener(successfulListener);

            const message = DomainMessage.create("test-uuid", 1, new TestEvent("test-uuid", "test-data"));
            await eventBus.publish(message);

            expect(failingListener.attemptCount).toBe(1);
            expect(successfulListener.processedMessages.length).toBe(1);
            expect(await dlq.count()).toBe(1);
        });
    });

    describe("publish - with retry policy", () => {
        it("should retry handler before sending to DLQ", async () => {
            const retryPolicy = new RetryPolicy({
                maxRetries: 2,
                baseDelayMs: 10, // Short delay for tests
                maxDelayMs: 100,
            });
            const eventBus = new DeadLetterAwareEventBus(dlq, retryPolicy);
            const failingSubscriber = new FailingSubscriber();

            eventBus.attach(FailingEvent, failingSubscriber);

            const message = DomainMessage.create("test-uuid", 1, new FailingEvent("test-uuid", "fail-data"));
            await eventBus.publish(message);

            // Should have attempted 1 initial + 2 retries = 3 attempts
            expect(failingSubscriber.attemptCount).toBe(3);
            expect(await dlq.count()).toBe(1);

            const dlqMessages = await dlq.getAll();
            expect(dlqMessages[0].retryCount).toBe(2); // Number of retries attempted
        });

        it("should succeed on retry if handler eventually succeeds", async () => {
            const retryPolicy = new RetryPolicy({
                maxRetries: 3,
                baseDelayMs: 10,
                maxDelayMs: 100,
            });
            const eventBus = new DeadLetterAwareEventBus(dlq, retryPolicy);
            const subscriber = new FailingThenSuccessSubscriber();
            subscriber.failUntilAttempt = 2; // Fail on first attempt, succeed on second

            eventBus.attach(FailingEvent, subscriber);

            const message = DomainMessage.create("test-uuid", 1, new FailingEvent("test-uuid", "eventually-succeeds"));
            await eventBus.publish(message);

            expect(subscriber.attemptCount).toBe(2);
            expect(subscriber.processedEvents.length).toBe(1);
            expect(await dlq.count()).toBe(0); // Should not be in DLQ since it succeeded
        });

        it("should not retry when retry policy has maxRetries=0", async () => {
            const retryPolicy = RetryPolicy.noRetry();
            const eventBus = new DeadLetterAwareEventBus(dlq, retryPolicy);
            const failingSubscriber = new FailingSubscriber();

            eventBus.attach(FailingEvent, failingSubscriber);

            const message = DomainMessage.create("test-uuid", 1, new FailingEvent("test-uuid", "no-retry"));
            await eventBus.publish(message);

            expect(failingSubscriber.attemptCount).toBe(1);
            expect(await dlq.count()).toBe(1);
        });
    });

    describe("retry", () => {
        it("should retry a message from DLQ successfully", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const failingSubscriber = new FailingSubscriber();

            eventBus.attach(FailingEvent, failingSubscriber);

            // First, cause a failure to add to DLQ
            const message = DomainMessage.create("test-uuid", 1, new FailingEvent("test-uuid", "fail-data"));
            await eventBus.publish(message);

            expect(await dlq.count()).toBe(1);
            const dlqMessages = await dlq.getAll();
            const messageId = dlqMessages[0].id;

            // Now retry with a working handler
            let retryHandlerCalled = false;
            const result = await eventBus.retry(messageId, async (msg) => {
                retryHandlerCalled = true;
            });

            expect(result).toBe(true);
            expect(retryHandlerCalled).toBe(true);
            expect(await dlq.count()).toBe(0); // Should be removed from DLQ
        });

        it("should update retry count on failed retry", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const failingSubscriber = new FailingSubscriber();

            eventBus.attach(FailingEvent, failingSubscriber);

            // First, cause a failure to add to DLQ
            const message = DomainMessage.create("test-uuid", 1, new FailingEvent("test-uuid", "fail-data"));
            await eventBus.publish(message);

            const dlqMessages = await dlq.getAll();
            const messageId = dlqMessages[0].id;
            const initialRetryCount = dlqMessages[0].retryCount;

            // Retry with a handler that also fails
            const result = await eventBus.retry(messageId, async () => {
                throw new Error("Retry also failed!");
            });

            expect(result).toBe(false);
            expect(await dlq.count()).toBe(1);

            const updatedMessage = await dlq.get(messageId);
            expect(updatedMessage?.retryCount).toBe(initialRetryCount + 1);
            expect(updatedMessage?.error.message).toBe("Retry also failed!");
        });

        it("should throw when retrying non-existent message", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);

            await expect(
                eventBus.retry("non-existent", async () => {})
            ).rejects.toThrow("not found");
        });
    });

    describe("integration scenarios", () => {
        it("should handle mixed success and failure across multiple handlers", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const successfulSubscriber = new SuccessfulSubscriber();
            const failingSubscriber = new FailingSubscriber();
            const successfulListener = new SuccessfulListener();
            const failingListener = new FailingListener();

            eventBus.attach(TestEvent, successfulSubscriber);
            eventBus.attach(FailingEvent, failingSubscriber);
            eventBus.addListener(successfulListener);
            eventBus.addListener(failingListener);

            // Publish a FailingEvent - failingSubscriber handles it and fails
            // Both listeners also try to handle it
            const message = DomainMessage.create("test-uuid", 1, new FailingEvent("test-uuid", "mixed"));
            await eventBus.publish(message);

            // FailingSubscriber should have failed and be in DLQ
            // FailingListener should have failed and be in DLQ
            // SuccessfulListener should have processed the message
            expect(failingSubscriber.attemptCount).toBe(1);
            expect(failingListener.attemptCount).toBe(1);
            expect(successfulListener.processedMessages.length).toBe(1);
            expect(await dlq.count()).toBe(2); // Two failures
        });

        it("should preserve message data through retry cycle", async () => {
            const eventBus = new DeadLetterAwareEventBus(dlq);
            const failingSubscriber = new FailingSubscriber();

            eventBus.attach(FailingEvent, failingSubscriber);

            const originalEvent = new FailingEvent("test-uuid", "preserve-this-data");
            const message = DomainMessage.create("test-uuid-123", 5, originalEvent);
            await eventBus.publish(message);

            const dlqMessages = await dlq.getAll();
            const deadLetter = dlqMessages[0];

            // Verify original message data is preserved
            expect(deadLetter.originalMessage.uuid).toBe("test-uuid-123");
            expect(deadLetter.originalMessage.playhead).toBe(5);
            expect((deadLetter.originalMessage.event as FailingEvent).data).toBe("preserve-this-data");
        });
    });
});
