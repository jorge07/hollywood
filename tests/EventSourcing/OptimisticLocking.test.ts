import "reflect-metadata";

import { Dog } from '../Domain/AggregateRoot.test';
import EventBus from "../../src/EventSourcing/EventBus/EventBus";
import EventStore from "../../src/EventSourcing/EventStore";
import InMemoryEventStore from "../../src/EventSourcing/InMemoryEventStore";
import ConcurrencyException from "../../src/EventSourcing/Exception/ConcurrencyException";
import Repository from "../../src/EventSourcing/Repository/Repository";
import { Identity } from "../../src/Domain/AggregateRoot";

class DogRepository extends Repository<Dog> {
    constructor(eventStore: EventStore<Dog>) {
        super(eventStore);
    }
}

describe("Optimistic Locking", () => {
    let eventBus: EventBus;
    let dbal: InMemoryEventStore;
    let store: EventStore<Dog>;
    let repository: DogRepository;

    beforeEach(() => {
        eventBus = new EventBus();
        dbal = new InMemoryEventStore();
        store = new EventStore<Dog>(Dog, dbal, eventBus);
        repository = new DogRepository(store);
    });

    describe("ConcurrencyException", () => {
        it("should create exception with correct properties", () => {
            const exception = new ConcurrencyException("aggregate-123", 5, 10);

            expect(exception.aggregateId).toBe("aggregate-123");
            expect(exception.expectedVersion).toBe(5);
            expect(exception.actualVersion).toBe(10);
            expect(exception.message).toBe(
                "Concurrency conflict for aggregate aggregate-123: expected version 5, actual 10"
            );
        });

        it("should be an instance of Error", () => {
            const exception = new ConcurrencyException("id", 1, 2);
            expect(exception).toBeInstanceOf(Error);
        });
    });

    describe("Version mismatch detection", () => {
        it("should throw ConcurrencyException when version mismatch occurs", async () => {
            const pluto = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));
            pluto.sayWolf();
            await store.save(pluto);

            // Load the same aggregate twice (simulating two concurrent operations)
            const dog1 = await store.load(Identity.fromString('00000000-0000-4000-8000-000000000031'));
            const dog2 = await store.load(Identity.fromString('00000000-0000-4000-8000-000000000031'));

            // Both make changes
            dog1.sayWolf();
            dog2.sayWolf();

            // First save succeeds
            await store.save(dog1);

            // Second save should fail due to version mismatch
            await expect(store.save(dog2)).rejects.toThrow(ConcurrencyException);
        });

        it("should include correct version information in exception", async () => {
            const pluto = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));
            pluto.sayWolf();
            await store.save(pluto);

            const dog1 = await store.load(Identity.fromString('00000000-0000-4000-8000-000000000031'));
            const dog2 = await store.load(Identity.fromString('00000000-0000-4000-8000-000000000031'));

            dog1.sayWolf();
            dog2.sayWolf();

            await store.save(dog1);

            try {
                await store.save(dog2);
                fail("Expected ConcurrencyException to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ConcurrencyException);
                const concurrencyError = error as ConcurrencyException;
                expect(concurrencyError.aggregateId).toBe("00000000-0000-4000-8000-000000000031");
                expect(concurrencyError.expectedVersion).toBe(0); // dog2 expected version 0 (before its changes)
                expect(concurrencyError.actualVersion).toBe(1);   // actual version is now 1 after dog1 saved
            }
        });
    });

    describe("Concurrent updates to same aggregate", () => {
        it("should handle multiple sequential updates correctly", async () => {
            const pluto = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000042'));
            pluto.sayWolf();
            await store.save(pluto);
            expect(pluto.version()).toBe(0);

            const dog1 = await store.load(Identity.fromString('00000000-0000-4000-8000-000000000042'));
            expect(dog1.version()).toBe(0);
            dog1.sayWolf();
            await store.save(dog1);

            const dog2 = await store.load(Identity.fromString('00000000-0000-4000-8000-000000000042'));
            expect(dog2.version()).toBe(1);
            dog2.sayWolf();
            await store.save(dog2);

            const finalDog = await store.load(Identity.fromString('00000000-0000-4000-8000-000000000042'));
            expect(finalDog.version()).toBe(2);
            expect(finalDog.wolfCount).toBe(3);
        });

        it("should detect conflict when third party modifies aggregate", async () => {
            const concurrentId = Identity.fromString('00000000-0000-4000-8000-0000000000cc');
            // Initial state
            const pluto = new Dog(concurrentId);
            pluto.sayWolf();
            await store.save(pluto);

            // User A loads
            const dogA = await store.load(concurrentId);

            // User B loads and saves (simulating concurrent modification)
            const dogB = await store.load(concurrentId);
            dogB.sayWolf();
            await store.save(dogB);

            // User A tries to save without reloading
            dogA.sayWolf();
            await expect(store.save(dogA)).rejects.toThrow(ConcurrencyException);
        });
    });

    describe("Successful sequential updates", () => {
        it("should allow sequential updates when loading between each save", async () => {
            const sequentialId = Identity.fromString('00000000-0000-4000-8000-0000000000aa');
            const pluto = new Dog(sequentialId);
            pluto.sayWolf();
            await store.save(pluto);

            for (let i = 0; i < 5; i++) {
                const dog = await store.load(sequentialId);
                dog.sayWolf();
                await store.save(dog);
            }

            const finalDog = await store.load(sequentialId);
            expect(finalDog.wolfCount).toBe(6); // 1 initial + 5 loop iterations
            expect(finalDog.version()).toBe(5); // version is 0-indexed
        });

        it("should handle multiple events in single save", async () => {
            const multiEventId = Identity.fromString('00000000-0000-4000-8000-0000000000bb');
            const pluto = new Dog(multiEventId);
            pluto.sayWolf();
            pluto.sayGrr();
            pluto.sayWolf();
            await store.save(pluto);

            expect(pluto.version()).toBe(2);

            const dog = await store.load(multiEventId);
            dog.sayWolf();
            dog.sayGrr();
            await store.save(dog);

            expect(dog.version()).toBe(4);

            const finalDog = await store.load(multiEventId);
            expect(finalDog.version()).toBe(4);
            expect(finalDog.wolfCount).toBe(3);
        });
    });

    describe("Retry mechanism", () => {
        it("should retry and succeed after conflict resolution", async () => {
            const retryId = Identity.fromString('00000000-0000-4000-8000-0000000000dd');
            const pluto = new Dog(retryId);
            pluto.sayWolf();
            await store.save(pluto);

            let attempts = 0;

            await repository.saveWithRetry(retryId, async (dog) => {
                attempts++;
                dog.sayWolf();
            }, 3);

            expect(attempts).toBe(1); // Should succeed on first try when no conflict
            const finalDog = await store.load(retryId);
            expect(finalDog.wolfCount).toBe(2);
        });

        it("should throw after max retries exceeded", async () => {
            const retryFailId = Identity.fromString('00000000-0000-4000-8000-0000000000ee');
            const pluto = new Dog(retryFailId);
            pluto.sayWolf();
            await store.save(pluto);

            // Create a scenario where updates always conflict
            // We'll intercept the save and create a conflict each time
            let attemptCount = 0;
            const originalSave = store.save.bind(store);

            jest.spyOn(store, 'save').mockImplementation(async (entity) => {
                attemptCount++;
                if (attemptCount <= 4) { // Fail first 4 attempts (initial + 3 retries)
                    throw new ConcurrencyException(entity.getAggregateRootId().toString(), 0, 1);
                }
                return originalSave(entity);
            });

            await expect(
                repository.saveWithRetry(retryFailId, (dog) => {
                    dog.sayWolf();
                }, 3)
            ).rejects.toThrow(ConcurrencyException);

            expect(attemptCount).toBe(4); // 1 initial + 3 retries
        });

        it("should rethrow non-concurrency errors immediately", async () => {
            const errorId = Identity.fromString('00000000-0000-4000-8000-0000000000ff');
            const pluto = new Dog(errorId);
            pluto.sayWolf();
            await store.save(pluto);

            const customError = new Error("Custom error");
            jest.spyOn(store, 'save').mockRejectedValue(customError);

            await expect(
                repository.saveWithRetry(errorId, (dog) => {
                    dog.sayWolf();
                }, 3)
            ).rejects.toThrow("Custom error");
        });

        it("should handle async update functions", async () => {
            const asyncId = Identity.fromString('00000000-0000-4000-8000-000000000099');
            const pluto = new Dog(asyncId);
            pluto.sayWolf();
            await store.save(pluto);

            await repository.saveWithRetry(asyncId, async (dog) => {
                await new Promise(resolve => setTimeout(resolve, 10));
                dog.sayWolf();
            }, 3);

            const finalDog = await store.load(asyncId);
            expect(finalDog.wolfCount).toBe(2);
        });
    });

    describe("New aggregate creation", () => {
        it("should allow saving new aggregate without version conflicts", async () => {
            const brandNewId = Identity.fromString('00000000-0000-4000-8000-000000000088');
            const newDog = new Dog(brandNewId);
            newDog.sayWolf();

            // First save of a new aggregate should always succeed
            await expect(store.save(newDog)).resolves.not.toThrow();

            const loaded = await store.load(brandNewId);
            expect(loaded.wolfCount).toBe(1);
        });
    });
});
