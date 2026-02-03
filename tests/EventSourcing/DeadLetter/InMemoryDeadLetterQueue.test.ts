import "reflect-metadata";

import InMemoryDeadLetterQueue from "../../../src/EventSourcing/DeadLetter/InMemoryDeadLetterQueue";
import { createDeadLetterMessage, DeadLetterMessage } from "../../../src/EventSourcing/DeadLetter/DeadLetterMessage";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import type DomainEvent from "../../../src/Domain/Event/DomainEvent";

class TestEvent implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly data: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

function createTestDeadLetterMessage(id: string, retryCount: number = 0): DeadLetterMessage {
    const domainMessage = DomainMessage.create("test-uuid", 1, new TestEvent("test-uuid", "test-data"));
    return createDeadLetterMessage(
        id,
        domainMessage,
        new Error("Test error"),
        "TestHandler",
        retryCount
    );
}

describe("InMemoryDeadLetterQueue", () => {
    let dlq: InMemoryDeadLetterQueue;

    beforeEach(() => {
        dlq = new InMemoryDeadLetterQueue();
    });

    describe("add", () => {
        it("should add a message to the queue", async () => {
            const message = createTestDeadLetterMessage("msg-1");
            await dlq.add(message);

            const count = await dlq.count();
            expect(count).toBe(1);
        });

        it("should allow adding multiple messages", async () => {
            await dlq.add(createTestDeadLetterMessage("msg-1"));
            await dlq.add(createTestDeadLetterMessage("msg-2"));
            await dlq.add(createTestDeadLetterMessage("msg-3"));

            const count = await dlq.count();
            expect(count).toBe(3);
        });

        it("should overwrite message with same id", async () => {
            const message1 = createTestDeadLetterMessage("msg-1", 0);
            const message2 = createTestDeadLetterMessage("msg-1", 1);

            await dlq.add(message1);
            await dlq.add(message2);

            const count = await dlq.count();
            expect(count).toBe(1);

            const retrieved = await dlq.get("msg-1");
            expect(retrieved?.retryCount).toBe(1);
        });
    });

    describe("get", () => {
        it("should retrieve a message by id", async () => {
            const message = createTestDeadLetterMessage("msg-1");
            await dlq.add(message);

            const retrieved = await dlq.get("msg-1");
            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe("msg-1");
            expect(retrieved?.handlerName).toBe("TestHandler");
        });

        it("should return undefined for non-existent message", async () => {
            const retrieved = await dlq.get("non-existent");
            expect(retrieved).toBeUndefined();
        });
    });

    describe("getAll", () => {
        it("should return empty array when queue is empty", async () => {
            const messages = await dlq.getAll();
            expect(messages).toEqual([]);
        });

        it("should return all messages in the queue", async () => {
            await dlq.add(createTestDeadLetterMessage("msg-1"));
            await dlq.add(createTestDeadLetterMessage("msg-2"));
            await dlq.add(createTestDeadLetterMessage("msg-3"));

            const messages = await dlq.getAll();
            expect(messages.length).toBe(3);
            expect(messages.map(m => m.id).sort()).toEqual(["msg-1", "msg-2", "msg-3"]);
        });
    });

    describe("remove", () => {
        it("should remove a message from the queue", async () => {
            await dlq.add(createTestDeadLetterMessage("msg-1"));
            await dlq.add(createTestDeadLetterMessage("msg-2"));

            await dlq.remove("msg-1");

            const count = await dlq.count();
            expect(count).toBe(1);

            const removed = await dlq.get("msg-1");
            expect(removed).toBeUndefined();
        });

        it("should not throw when removing non-existent message", async () => {
            await expect(dlq.remove("non-existent")).resolves.toBeUndefined();
        });
    });

    describe("update", () => {
        it("should update an existing message", async () => {
            const original = createTestDeadLetterMessage("msg-1", 0);
            await dlq.add(original);

            const updated = createTestDeadLetterMessage("msg-1", 1);
            await dlq.update(updated);

            const retrieved = await dlq.get("msg-1");
            expect(retrieved?.retryCount).toBe(1);
        });

        it("should throw when updating non-existent message", async () => {
            const message = createTestDeadLetterMessage("non-existent");
            await expect(dlq.update(message)).rejects.toThrow("not found");
        });
    });

    describe("count", () => {
        it("should return 0 for empty queue", async () => {
            const count = await dlq.count();
            expect(count).toBe(0);
        });

        it("should return correct count", async () => {
            await dlq.add(createTestDeadLetterMessage("msg-1"));
            await dlq.add(createTestDeadLetterMessage("msg-2"));

            const count = await dlq.count();
            expect(count).toBe(2);
        });
    });

    describe("clear", () => {
        it("should remove all messages from the queue", async () => {
            await dlq.add(createTestDeadLetterMessage("msg-1"));
            await dlq.add(createTestDeadLetterMessage("msg-2"));
            await dlq.add(createTestDeadLetterMessage("msg-3"));

            await dlq.clear();

            const count = await dlq.count();
            expect(count).toBe(0);

            const messages = await dlq.getAll();
            expect(messages).toEqual([]);
        });
    });
});
