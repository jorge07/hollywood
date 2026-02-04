# Projections & Read Models

Projections transform event streams into optimized read models. In CQRS, projections build the query side of your application.

## What Are Projections?

When using Event Sourcing:
- **Write side**: Events are stored in the event store
- **Read side**: Projections build denormalized views from events

Projections enable:
- Fast queries without reconstructing aggregates
- Multiple views of the same data
- Optimized data structures for specific use cases

## Creating a Projector

A projector extends `EventSubscriber` and handles specific events:

```typescript
import { ReadModel, EventSourcing, Domain } from "hollywood-js";

class UserListProjector extends EventSourcing.EventSubscriber {
    constructor(private readonly repository: UserListRepository) {
        super();
        // Register event handlers
        this.registerHandler(UserCreated, this.onUserCreated.bind(this));
        this.registerHandler(UserEmailChanged, this.onUserEmailChanged.bind(this));
        this.registerHandler(UserDeleted, this.onUserDeleted.bind(this));
    }

    private async onUserCreated(message: Domain.DomainMessage): Promise<void> {
        const event = message.event as UserCreated;
        await this.repository.save({
            id: event.uuid,
            name: event.name,
            email: event.email,
            createdAt: event.createdAt,
        });
    }

    private async onUserEmailChanged(message: Domain.DomainMessage): Promise<void> {
        const event = message.event as UserEmailChanged;
        const user = await this.repository.get(event.uuid);
        if (user) {
            user.email = event.newEmail;
            await this.repository.save(user);
        }
    }

    private async onUserDeleted(message: Domain.DomainMessage): Promise<void> {
        const event = message.event as UserDeleted;
        await this.repository.remove(event.uuid);
    }
}
```

## Attaching Projectors to EventBus

```typescript
const userListProjector = new UserListProjector(userListRepository);

// Subscribe to specific events
eventBus.attach(UserCreated, userListProjector);
eventBus.attach(UserEmailChanged, userListProjector);
eventBus.attach(UserDeleted, userListProjector);
```

## Read Model Repositories

Hollywood provides an in-memory implementation for testing:

```typescript
import { ReadModel } from "hollywood-js";

interface UserReadModel {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

const repository = new ReadModel.InMemoryReadModelRepository<UserReadModel>();

// Save
await repository.save({ id: "123", name: "John", email: "john@example.com", createdAt: new Date() });

// Get by ID
const user = await repository.get("123");

// Find by criteria
const users = await repository.find({ email: "john@example.com" });

// Remove
await repository.remove("123");
```

## Projection Rebuild

When you need to rebuild projections (new read model, bug fix, etc.), use `ProjectionManager`:

```typescript
import { ReadModel } from "hollywood-js";

const projectionManager = new ReadModel.ProjectionManager(
    eventStoreDBAL,      // Access to all events
    positionStore        // Tracks projection position
);

// Rebuild from scratch
await projectionManager.rebuild(userListProjector);

// Catch up from last position
await projectionManager.catchUp(userListProjector);

// Check current position
const position = await projectionManager.getPosition("UserListProjector");
```

## Position Tracking

The `ProjectionPositionStore` tracks which events each projector has processed:

```typescript
import { ReadModel } from "hollywood-js";

// In-memory for development
const positionStore = new ReadModel.InMemoryProjectionPositionStore();

// Get position
const position = await positionStore.get("UserListProjector");
// { projectionName: "UserListProjector", lastProcessedPosition: 42, lastProcessedAt: Date }

// Reset for rebuild
await positionStore.reset("UserListProjector");
```

## Multiple Projections

Create different projections for different use cases:

```typescript
// List view with basic info
class UserListProjector extends EventSubscriber { ... }

// Detail view with full info
class UserDetailProjector extends EventSubscriber { ... }

// Search index for full-text search
class UserSearchProjector extends EventSubscriber { ... }

// Analytics for reporting
class UserAnalyticsProjector extends EventSubscriber { ... }
```

## Query Handlers with Projections

Use projections in query handlers:

```typescript
class GetUserListHandler implements IQueryHandler {
    constructor(private readonly repository: UserListRepository) {}

    async handle(query: GetUserList): Promise<IAppResponse<UserReadModel[]>> {
        const users = await this.repository.find(query.filters);
        return { data: users, meta: [] };
    }
}
```

## Module Configuration

```typescript
const services = new Map()
    // Read model repository
    .set("user.readModel.repository", {
        instance: ReadModel.InMemoryReadModelRepository,
    })
    // Position store
    .set("shared.projection.positionStore", {
        instance: ReadModel.InMemoryProjectionPositionStore,
    })
    // Projection manager
    .set("shared.projection.manager", {
        instance: ReadModel.ProjectionManager,
        deps: ["shared.eventStore.dbal", "shared.projection.positionStore"],
    })
    // Projector
    .set("user.projector.list", {
        instance: UserListProjector,
        deps: ["user.readModel.repository"],
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        subscriber: [UserCreated, UserEmailChanged, UserDeleted],
    });
```

## Best Practices

1. **Keep projectors simple** - One projection per use case
2. **Make projections idempotent** - Handle duplicate events gracefully
3. **Use position tracking** - Enable catch-up and rebuild
4. **Separate storage** - Projections can use different databases
5. **Test projections** - Verify they handle all events correctly

---

**Next:** [Server Integration](server-integration.md)
