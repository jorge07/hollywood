import DomainMessage from "../../../src/Domain/Event/DomainMessage";

class TestEvent {
    constructor(public readonly value: string) {}
}

describe("DomainMessage idempotencyKey", () => {
    describe("automatic generation", () => {
        it("should generate an idempotency key automatically", () => {
            const message = DomainMessage.create("123", 0, new TestEvent("test"));

            expect(message.idempotencyKey).toBeDefined();
            expect(typeof message.idempotencyKey).toBe("string");
            expect(message.idempotencyKey.length).toBeGreaterThan(0);
        });

        it("should generate unique keys for different playheads", () => {
            const message1 = DomainMessage.create("123", 0, new TestEvent("test"));
            const message2 = DomainMessage.create("123", 1, new TestEvent("test"));

            expect(message1.idempotencyKey).not.toBe(message2.idempotencyKey);
        });

        it("should generate unique keys for different aggregate IDs", () => {
            const message1 = DomainMessage.create("123", 0, new TestEvent("test"));
            const message2 = DomainMessage.create("456", 0, new TestEvent("test"));

            expect(message1.idempotencyKey).not.toBe(message2.idempotencyKey);
        });

        it("should include aggregate ID in the key", () => {
            const message = DomainMessage.create("my-unique-id", 5, new TestEvent("test"));

            expect(message.idempotencyKey).toContain("my-unique-id");
        });

        it("should include playhead in the key", () => {
            const message = DomainMessage.create("123", 42, new TestEvent("test"));

            expect(message.idempotencyKey).toContain("42");
        });
    });

    describe("custom idempotency key", () => {
        it("should use custom idempotency key when provided", () => {
            const customKey = "my-custom-idempotency-key";
            const message = DomainMessage.create("123", 0, new TestEvent("test"), [], undefined, customKey);

            expect(message.idempotencyKey).toBe(customKey);
        });

        it("should preserve custom key even with different content", () => {
            const customKey = "shared-key";
            const message1 = DomainMessage.create("123", 0, new TestEvent("value1"), [], undefined, customKey);
            const message2 = DomainMessage.create("456", 5, new TestEvent("value2"), [], undefined, customKey);

            expect(message1.idempotencyKey).toBe(customKey);
            expect(message2.idempotencyKey).toBe(customKey);
            expect(message1.idempotencyKey).toBe(message2.idempotencyKey);
        });
    });

    describe("key format", () => {
        it("should generate a key with expected format (uuid-playhead-hash)", () => {
            const message = DomainMessage.create("test-uuid", 3, new TestEvent("test"));

            // Key format: {uuid}-{playhead}-{hash}
            const parts = message.idempotencyKey.split("-");
            expect(parts.length).toBeGreaterThanOrEqual(3);
            expect(parts[0]).toBe("test");
            expect(parts[1]).toBe("uuid");
        });
    });

    describe("consistency", () => {
        it("should preserve all existing DomainMessage properties", () => {
            const event = new TestEvent("test-value");
            const metadata = [{ key: "value" }];
            const message = DomainMessage.create("123", 5, event, metadata);

            expect(message.uuid).toBe("123");
            expect(message.playhead).toBe(5);
            expect(message.event).toBe(event);
            expect(message.metadata).toBe(metadata);
            expect(message.eventType).toBe("TestEvent");
            expect(message.occurred).toBeInstanceOf(Date);
            expect(message.idempotencyKey).toBeDefined();
        });
    });
});
