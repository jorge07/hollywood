import "reflect-metadata";

import DomainEvent from "../../../src/Domain/Event/DomainEvent";
import { EventUpcaster } from "../../../src/EventSourcing/Upcasting/EventUpcaster";
import { UpcasterChain } from "../../../src/EventSourcing/Upcasting/UpcasterChain";

// Test events with versions
class UserCreatedEventV1 extends DomainEvent {
    public readonly version: number = 1;

    constructor(
        public readonly userId: string,
        public readonly name: string,
    ) {
        super();
    }
}

class UserCreatedEventV2 extends DomainEvent {
    public readonly version: number = 2;

    constructor(
        public readonly userId: string,
        public readonly name: string,
        public readonly email: string,
    ) {
        super();
    }

    public domainEventName(): string {
        return "UserCreatedEventV1";
    }
}

class UserCreatedEventV3 extends DomainEvent {
    public readonly version: number = 3;

    constructor(
        public readonly userId: string,
        public readonly name: string,
        public readonly email: string,
        public readonly createdAt: Date,
    ) {
        super();
    }

    public domainEventName(): string {
        return "UserCreatedEventV1";
    }
}

class UnversionedEvent extends DomainEvent {
    constructor(public readonly data: string) {
        super();
    }
}

describe("UpcasterChain", () => {
    describe("register", () => {
        it("should register an upcaster successfully", () => {
            const chain = new UpcasterChain();

            const upcaster: EventUpcaster<UserCreatedEventV1> = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event) => new UserCreatedEventV2(event.userId, event.name, "") as any,
            };

            chain.register(upcaster);

            expect(chain.hasUpcastersFor("UserCreatedEventV1")).toBe(true);
            expect(chain.getUpcasterCount("UserCreatedEventV1")).toBe(1);
        });

        it("should register multiple upcasters for the same event type", () => {
            const chain = new UpcasterChain();

            const upcasterV1ToV2: EventUpcaster = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => new UserCreatedEventV2(event.userId, event.name, "") as any,
            };

            const upcasterV2ToV3: EventUpcaster = {
                eventType: "UserCreatedEventV1",
                fromVersion: 2,
                toVersion: 3,
                upcast: (event: any) => new UserCreatedEventV3(event.userId, event.name, event.email, new Date()) as any,
            };

            chain.register(upcasterV1ToV2);
            chain.register(upcasterV2ToV3);

            expect(chain.getUpcasterCount("UserCreatedEventV1")).toBe(2);
        });

        it("should throw error when registering duplicate fromVersion", () => {
            const chain = new UpcasterChain();

            const upcaster1: EventUpcaster = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => event,
            };

            const upcaster2: EventUpcaster = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => event,
            };

            chain.register(upcaster1);

            expect(() => chain.register(upcaster2)).toThrow(
                "Upcaster for event type 'UserCreatedEventV1' from version 1 already registered"
            );
        });

        it("should register upcasters for different event types", () => {
            const chain = new UpcasterChain();

            const userUpcaster: EventUpcaster = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => event,
            };

            const orderUpcaster: EventUpcaster = {
                eventType: "OrderCreatedEvent",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => event,
            };

            chain.register(userUpcaster);
            chain.register(orderUpcaster);

            expect(chain.hasUpcastersFor("UserCreatedEventV1")).toBe(true);
            expect(chain.hasUpcastersFor("OrderCreatedEvent")).toBe(true);
            expect(chain.getUpcasterCount("UserCreatedEventV1")).toBe(1);
            expect(chain.getUpcasterCount("OrderCreatedEvent")).toBe(1);
        });
    });

    describe("upcast", () => {
        it("should upcast a single version upgrade", () => {
            const chain = new UpcasterChain();

            const upcaster: EventUpcaster<UserCreatedEventV1> = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event) => {
                    return new UserCreatedEventV2(event.userId, event.name, "default@email.com") as any;
                },
            };

            chain.register(upcaster);

            const v1Event = new UserCreatedEventV1("user-123", "John Doe");
            const upcastedEvent = chain.upcast(v1Event) as UserCreatedEventV2;

            expect(upcastedEvent.version).toBe(2);
            expect(upcastedEvent.userId).toBe("user-123");
            expect(upcastedEvent.name).toBe("John Doe");
            expect(upcastedEvent.email).toBe("default@email.com");
        });

        it("should upcast through multiple version upgrades", () => {
            const chain = new UpcasterChain();
            const fixedDate = new Date("2024-01-01T00:00:00.000Z");

            const upcasterV1ToV2: EventUpcaster<UserCreatedEventV1> = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event) => {
                    return new UserCreatedEventV2(event.userId, event.name, "default@email.com") as any;
                },
            };

            const upcasterV2ToV3: EventUpcaster<UserCreatedEventV2> = {
                eventType: "UserCreatedEventV1",
                fromVersion: 2,
                toVersion: 3,
                upcast: (event) => {
                    return new UserCreatedEventV3(event.userId, event.name, event.email, fixedDate) as any;
                },
            };

            chain.register(upcasterV1ToV2);
            chain.register(upcasterV2ToV3);

            const v1Event = new UserCreatedEventV1("user-123", "John Doe");
            const upcastedEvent = chain.upcast(v1Event) as UserCreatedEventV3;

            expect(upcastedEvent.version).toBe(3);
            expect(upcastedEvent.userId).toBe("user-123");
            expect(upcastedEvent.name).toBe("John Doe");
            expect(upcastedEvent.email).toBe("default@email.com");
            expect(upcastedEvent.createdAt).toEqual(fixedDate);
        });

        it("should pass through unknown events unchanged", () => {
            const chain = new UpcasterChain();

            const upcaster: EventUpcaster = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => event,
            };

            chain.register(upcaster);

            const unknownEvent = new UnversionedEvent("some data");
            const result = chain.upcast(unknownEvent);

            expect(result).toBe(unknownEvent);
            expect(result).toBeInstanceOf(UnversionedEvent);
        });

        it("should pass through events with no registered upcasters", () => {
            const chain = new UpcasterChain();

            const v1Event = new UserCreatedEventV1("user-123", "John Doe");
            const result = chain.upcast(v1Event);

            expect(result).toBe(v1Event);
        });

        it("should not upcast if event is already at target version", () => {
            const chain = new UpcasterChain();

            const upcaster: EventUpcaster<UserCreatedEventV1> = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event) => {
                    return new UserCreatedEventV2(event.userId, event.name, "default@email.com") as any;
                },
            };

            chain.register(upcaster);

            // Create a v2 event directly
            const v2Event = new UserCreatedEventV2("user-123", "John Doe", "john@example.com");
            const result = chain.upcast(v2Event);

            // The event should not be upcasted since its version (2) doesn't match fromVersion (1)
            expect(result).toBe(v2Event);
            expect(result.version).toBe(2);
        });

        it("should upcast from intermediate version", () => {
            const chain = new UpcasterChain();
            const fixedDate = new Date("2024-01-01T00:00:00.000Z");

            const upcasterV1ToV2: EventUpcaster<UserCreatedEventV1> = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event) => {
                    return new UserCreatedEventV2(event.userId, event.name, "default@email.com") as any;
                },
            };

            const upcasterV2ToV3: EventUpcaster<UserCreatedEventV2> = {
                eventType: "UserCreatedEventV1",
                fromVersion: 2,
                toVersion: 3,
                upcast: (event) => {
                    return new UserCreatedEventV3(event.userId, event.name, event.email, fixedDate) as any;
                },
            };

            chain.register(upcasterV1ToV2);
            chain.register(upcasterV2ToV3);

            // Start from v2 event
            const v2Event = new UserCreatedEventV2("user-123", "John Doe", "john@example.com");
            const upcastedEvent = chain.upcast(v2Event) as UserCreatedEventV3;

            expect(upcastedEvent.version).toBe(3);
            expect(upcastedEvent.email).toBe("john@example.com"); // Preserved from v2
            expect(upcastedEvent.createdAt).toEqual(fixedDate);
        });
    });

    describe("hasUpcastersFor", () => {
        it("should return false for event types with no upcasters", () => {
            const chain = new UpcasterChain();

            expect(chain.hasUpcastersFor("NonExistentEvent")).toBe(false);
        });

        it("should return true for event types with upcasters", () => {
            const chain = new UpcasterChain();

            const upcaster: EventUpcaster = {
                eventType: "UserCreatedEventV1",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => event,
            };

            chain.register(upcaster);

            expect(chain.hasUpcastersFor("UserCreatedEventV1")).toBe(true);
        });
    });

    describe("getUpcasterCount", () => {
        it("should return 0 for event types with no upcasters", () => {
            const chain = new UpcasterChain();

            expect(chain.getUpcasterCount("NonExistentEvent")).toBe(0);
        });

        it("should return correct count for registered upcasters", () => {
            const chain = new UpcasterChain();

            chain.register({
                eventType: "TestEvent",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => event,
            });

            chain.register({
                eventType: "TestEvent",
                fromVersion: 2,
                toVersion: 3,
                upcast: (event: any) => event,
            });

            chain.register({
                eventType: "TestEvent",
                fromVersion: 3,
                toVersion: 4,
                upcast: (event: any) => event,
            });

            expect(chain.getUpcasterCount("TestEvent")).toBe(3);
        });
    });

    describe("upcaster ordering", () => {
        it("should apply upcasters in correct order regardless of registration order", () => {
            const chain = new UpcasterChain();
            const executionOrder: number[] = [];

            // Register in reverse order
            chain.register({
                eventType: "TestEvent",
                fromVersion: 3,
                toVersion: 4,
                upcast: (event: any) => {
                    executionOrder.push(3);
                    return { ...event, version: 4 };
                },
            });

            chain.register({
                eventType: "TestEvent",
                fromVersion: 1,
                toVersion: 2,
                upcast: (event: any) => {
                    executionOrder.push(1);
                    return { ...event, version: 2 };
                },
            });

            chain.register({
                eventType: "TestEvent",
                fromVersion: 2,
                toVersion: 3,
                upcast: (event: any) => {
                    executionOrder.push(2);
                    return { ...event, version: 3 };
                },
            });

            class TestEvent extends DomainEvent {
                public readonly version = 1;
            }

            chain.upcast(new TestEvent());

            expect(executionOrder).toEqual([1, 2, 3]);
        });
    });
});
