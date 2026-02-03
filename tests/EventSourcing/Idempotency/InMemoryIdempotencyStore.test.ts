import InMemoryIdempotencyStore from "../../../src/EventSourcing/Idempotency/InMemoryIdempotencyStore";

describe("InMemoryIdempotencyStore", () => {
    let store: InMemoryIdempotencyStore;

    beforeEach(() => {
        // Use a very long cleanup interval for tests to prevent interference
        store = new InMemoryIdempotencyStore(0);
    });

    afterEach(() => {
        store.stopCleanup();
        store.clear();
    });

    describe("exists", () => {
        it("should return false for non-existent key", async () => {
            const result = await store.exists("non-existent-key");
            expect(result).toBe(false);
        });

        it("should return true for existing key", async () => {
            await store.mark("test-key");
            const result = await store.exists("test-key");
            expect(result).toBe(true);
        });
    });

    describe("mark", () => {
        it("should mark a key as processed", async () => {
            await store.mark("test-key");
            expect(store.size()).toBe(1);
            expect(await store.exists("test-key")).toBe(true);
        });

        it("should allow marking the same key multiple times", async () => {
            await store.mark("test-key");
            await store.mark("test-key");
            expect(store.size()).toBe(1);
        });

        it("should mark key with TTL", async () => {
            await store.mark("test-key", 1000);
            expect(await store.exists("test-key")).toBe(true);
        });
    });

    describe("remove", () => {
        it("should remove an existing key", async () => {
            await store.mark("test-key");
            await store.remove("test-key");
            expect(await store.exists("test-key")).toBe(false);
        });

        it("should not throw when removing non-existent key", async () => {
            await expect(store.remove("non-existent")).resolves.not.toThrow();
        });
    });

    describe("TTL expiration", () => {
        it("should return false for expired key", async () => {
            await store.mark("test-key", 10); // 10ms TTL

            // Wait for expiration
            await new Promise((resolve) => setTimeout(resolve, 50));

            const result = await store.exists("test-key");
            expect(result).toBe(false);
        });

        it("should return true for non-expired key", async () => {
            await store.mark("test-key", 1000); // 1 second TTL

            const result = await store.exists("test-key");
            expect(result).toBe(true);
        });

        it("should keep key without TTL indefinitely", async () => {
            await store.mark("test-key"); // No TTL

            // Wait a bit
            await new Promise((resolve) => setTimeout(resolve, 50));

            const result = await store.exists("test-key");
            expect(result).toBe(true);
        });
    });

    describe("cleanup", () => {
        it("should remove expired keys during cleanup", async () => {
            await store.mark("expired-key", 10);
            await store.mark("valid-key", 10000);
            await store.mark("permanent-key");

            // Wait for first key to expire
            await new Promise((resolve) => setTimeout(resolve, 50));

            const removedCount = store.cleanup();

            expect(removedCount).toBe(1);
            expect(await store.exists("expired-key")).toBe(false);
            expect(await store.exists("valid-key")).toBe(true);
            expect(await store.exists("permanent-key")).toBe(true);
        });

        it("should return 0 when no keys are expired", async () => {
            await store.mark("key1", 10000);
            await store.mark("key2");

            const removedCount = store.cleanup();
            expect(removedCount).toBe(0);
        });
    });

    describe("clear", () => {
        it("should remove all keys", async () => {
            await store.mark("key1");
            await store.mark("key2");
            await store.mark("key3");

            store.clear();

            expect(store.size()).toBe(0);
        });
    });

    describe("size", () => {
        it("should return correct count", async () => {
            expect(store.size()).toBe(0);

            await store.mark("key1");
            expect(store.size()).toBe(1);

            await store.mark("key2");
            expect(store.size()).toBe(2);

            await store.remove("key1");
            expect(store.size()).toBe(1);
        });
    });

    describe("automatic cleanup", () => {
        it("should automatically clean up expired keys", async () => {
            // Create store with short cleanup interval
            const autoCleanStore = new InMemoryIdempotencyStore(50);

            await autoCleanStore.mark("expired-key", 10);

            // Wait for cleanup to run
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(autoCleanStore.size()).toBe(0);

            autoCleanStore.stopCleanup();
        });
    });
});
