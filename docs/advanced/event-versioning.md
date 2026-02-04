# Event Versioning

Event schemas evolve over time. Hollywood provides upcasting to migrate old events to new versions at read time, preserving original events in storage.

## Why Event Versioning?

Event Sourcing stores events forever. As your domain evolves:
- New fields may be required
- Field types may change
- Fields may be renamed or removed

Upcasting transforms old events to the current schema without modifying stored data.

## Creating an Upcaster

An upcaster defines a version transition for a specific event type:

```typescript
import { EventSourcing } from "hollywood-js";

// Upcaster: UserCreated v1 -> v2 (add email field)
const userCreatedV1ToV2: EventSourcing.EventUpcaster<UserCreated> = {
    eventType: "UserCreated",
    fromVersion: 1,
    toVersion: 2,
    upcast: (event) => ({
        ...event,
        email: event.email || "unknown@example.com",
        version: 2,
    }),
};

// Upcaster: UserCreated v2 -> v3 (add createdAt field)
const userCreatedV2ToV3: EventSourcing.EventUpcaster<UserCreated> = {
    eventType: "UserCreated",
    fromVersion: 2,
    toVersion: 3,
    upcast: (event) => ({
        ...event,
        createdAt: event.createdAt || new Date(),
        version: 3,
    }),
};
```

## Registering Upcasters

Create an `UpcasterChain` and register upcasters in version order:

```typescript
import { EventSourcing } from "hollywood-js";

const upcasterChain = new EventSourcing.UpcasterChain();

// Register in version order
upcasterChain.register(userCreatedV1ToV2);
upcasterChain.register(userCreatedV2ToV3);
```

## Connecting to EventStore

Pass the `UpcasterChain` to your `EventStore`:

```typescript
const eventStore = new EventSourcing.EventStore(
    dbal,
    eventBus,
    UserAggregate,        // Aggregate constructor
    snapshotStore,        // Optional
    10,                   // Snapshot margin
    upcasterChain         // Upcaster chain
);
```

## How It Works

When events are loaded from storage:

```
Stored: UserCreated v1 { uuid, name }
        ↓
Upcaster v1→v2: { uuid, name, email: 'unknown@example.com', version: 2 }
        ↓
Upcaster v2→v3: { uuid, name, email, createdAt: Date, version: 3 }
        ↓
Aggregate receives v3 event
```

## Versioning Events

Add a `version` property to your events:

```typescript
class UserCreated implements DomainEvent {
    readonly version: number = 3;  // Current version

    constructor(
        public readonly uuid: string,
        public readonly name: string,
        public readonly email: string,
        public readonly createdAt: Date
    ) {}
}
```

Events without a `version` property are treated as version 1.

## Best Practices

1. **Never modify stored events** - Always use upcasting
2. **Keep upcasters simple** - One transformation per upcaster
3. **Chain upcasters sequentially** - v1→v2→v3, not v1→v3
4. **Provide sensible defaults** - Handle missing fields gracefully
5. **Test your upcasters** - Verify old events transform correctly

## Module Configuration

```typescript
const services = new Map()
    .set("user.upcaster.chain", {
        instance: EventSourcing.UpcasterChain,
        setup: (chain: UpcasterChain) => {
            chain.register(userCreatedV1ToV2);
            chain.register(userCreatedV2ToV3);
            return chain;
        },
    })
    .set("user.eventStore", {
        instance: EventSourcing.EventStore,
        deps: [
            "user.eventStore.dbal",
            SERVICES_ALIAS.DEFAULT_EVENT_BUS,
            { use: () => UserAggregate },
            "user.snapshotStore",
            { use: () => 10 },
            "user.upcaster.chain",
        ],
    });
```

---

**Next:** [Dead Letter Queue](dead-letter-queue.md)
