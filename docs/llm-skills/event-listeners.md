# Event Listeners and Subscribers

## Overview

Hollywood-JS provides two mechanisms for reacting to domain events:

- **EventSubscriber**: Subscribe to specific event types
- **EventListener**: Receive all events (audit logging, debugging)

**Source files:**

- `src/EventSourcing/EventBus/EventBus.ts`
- `src/EventSourcing/EventBus/EventSubscriber.ts`
- `src/EventSourcing/EventBus/EventListener.ts`
- `src/ReadModel/Projector.ts`

## EventSubscriber

Subscribes to specific domain events with type-safe handlers.

### Explicit Handler Registration (Recommended)

```typescript
import { EventSourcing } from "hollywood-js";
import type { Domain } from "hollywood-js";

// Domain events
class OrderCreated implements Domain.DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly customerId: string
    ) {}
}

class OrderShipped implements Domain.DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly shippedAt: Date
    ) {}
}

// Subscriber with explicit handler registration
class OrderNotificationSubscriber extends EventSourcing.EventSubscriber {
    constructor(private readonly emailService: EmailService) {
        super();

        // Register handlers in constructor
        this.registerHandler(OrderCreated, this.onOrderCreated.bind(this));
        this.registerHandler(OrderShipped, this.onOrderShipped.bind(this));
    }

    private async onOrderCreated(event: OrderCreated): Promise<void> {
        await this.emailService.sendOrderConfirmation(
            event.orderId,
            event.customerId
        );
    }

    private async onOrderShipped(event: OrderShipped): Promise<void> {
        await this.emailService.sendShippingNotification(event.orderId);
    }
}
```

### Legacy Pattern (Backwards Compatible)

Use `on{EventType}` methods discovered via reflection:

```typescript
class LegacyOrderSubscriber extends EventSourcing.EventSubscriber {
    // Method name must match: on + EventClassName
    protected onOrderCreated(event: OrderCreated): void {
        console.log(`Order created: ${event.orderId}`);
    }

    protected onOrderShipped(event: OrderShipped): void {
        console.log(`Order shipped: ${event.orderId}`);
    }
}
```

### Async Handlers

Both sync and async handlers are supported:

```typescript
class AsyncSubscriber extends EventSourcing.EventSubscriber {
    constructor() {
        super();
        this.registerHandler(OrderCreated, this.handleOrderCreated.bind(this));
    }

    // Async handler
    private async handleOrderCreated(event: OrderCreated): Promise<void> {
        await this.externalService.notify(event);
    }
}
```

### Registering Subscribers

Subscribers are attached to specific events on the EventBus:

```typescript
const eventBus = new EventSourcing.EventBus();

// Attach subscriber to specific events
eventBus.attach(OrderCreated, new OrderNotificationSubscriber(emailService));
eventBus.attach(OrderShipped, new OrderNotificationSubscriber(emailService));
```

## EventListener

Receives ALL events published to the bus. Use for cross-cutting concerns.

```typescript
import { Domain, EventSourcing } from "hollywood-js";

class AuditLogListener extends EventSourcing.EventListener {
    constructor(private readonly auditLog: AuditLogService) {
        super();
    }

    // Receives DomainMessage wrapping the event
    public async on(message: Domain.DomainMessage): Promise<void> {
        await this.auditLog.record({
            aggregateId: message.uuid,
            eventType: message.eventType,
            playhead: message.playhead,
            occurredAt: message.occurred,
            payload: message.event
        });
    }
}
```

### Registering Listeners

```typescript
const eventBus = new EventSourcing.EventBus();

// Add listener - receives all events
eventBus.addListener(new AuditLogListener(auditLogService));
```

## Projectors (Read Models)

Projectors are EventSubscribers that maintain denormalized read models:

```typescript
import { EventSourcing, ReadModel } from "hollywood-js";
import type Projector from "hollywood-js/src/ReadModel/Projector";

// Using the Projector type alias (which is EventSubscriber)
class OrderListProjector extends EventSourcing.EventSubscriber {
    constructor(
        private readonly readModel: ReadModel.InMemoryReadModelRepository
    ) {
        super();
        this.registerHandler(OrderCreated, this.onOrderCreated.bind(this));
        this.registerHandler(OrderShipped, this.onOrderShipped.bind(this));
    }

    private onOrderCreated(event: OrderCreated): void {
        this.readModel.save(event.orderId, {
            orderId: event.orderId,
            customerId: event.customerId,
            status: "pending",
            createdAt: new Date()
        });
    }

    private onOrderShipped(event: OrderShipped): void {
        const existing = this.readModel.oneOrFail(event.orderId);
        this.readModel.save(event.orderId, {
            ...existing,
            status: "shipped",
            shippedAt: event.shippedAt
        });
    }
}

// Type the projector using the Projector type
const projector: Projector = new OrderListProjector(readModelRepo);
```

### InMemoryReadModelRepository

Built-in repository for read models:

```typescript
import { ReadModel } from "hollywood-js";

const repository = new ReadModel.InMemoryReadModelRepository();

// Save data
repository.save("order-1", { status: "pending" });

// Retrieve (throws if not found)
const order = repository.oneOrFail("order-1");

// Find with criteria
const pending = repository.find(collection =>
    Object.values(collection).filter(o => o.status === "pending")
);
```

## Module Configuration

### Subscriber Configuration

```typescript
import { Framework } from "hollywood-js";

const services = new Map([
    // Email service dependency
    ["email.service", { instance: EmailService }],

    // Subscriber with event subscriptions
    [
        "order.notification.subscriber",
        {
            instance: OrderNotificationSubscriber,
            bus: "hollywood.infrastructure.eventBus.default",
            subscriber: [OrderCreated, OrderShipped]  // Events to subscribe to
        }
    ],

    // Projector
    [
        "order.list.projector",
        {
            instance: OrderListProjector,
            bus: "hollywood.infrastructure.eventBus.default",
            subscriber: [OrderCreated, OrderShipped]
        }
    ]
]);

const OrderModule = new Framework.ModuleContext({
    services
});
```

### Listener Configuration

```typescript
const services = new Map([
    [
        "audit.listener",
        {
            instance: AuditLogListener,
            bus: "hollywood.infrastructure.eventBus.default",
            listener: true  // Marks as listener (receives all events)
        }
    ]
]);
```

## Event Flow

```text
Aggregate.raise(event)
    |
    v
EventStore.save(aggregate)
    |
    v
EventBus.publish(domainMessage)
    |
    +---> EventSubscriber.on(message) [for subscribed event types]
    |
    +---> EventListener.on(message) [for all events]
```

## Complete Example

```typescript
import "reflect-metadata";
import { Framework, EventSourcing, Domain, ReadModel } from "hollywood-js";
import { injectable, inject } from "inversify";

// Events
class UserCreated implements Domain.DomainEvent {
    constructor(
        public readonly userId: string,
        public readonly email: string
    ) {}
}

// Read model projector
@injectable()
class UserProjector extends EventSourcing.EventSubscriber {
    constructor(
        @inject("user.readModel") private readonly readModel: ReadModel.InMemoryReadModelRepository
    ) {
        super();
        this.registerHandler(UserCreated, this.onUserCreated.bind(this));
    }

    private onUserCreated(event: UserCreated): void {
        this.readModel.save(event.userId, {
            id: event.userId,
            email: event.email,
            createdAt: new Date()
        });
    }
}

// Audit listener
@injectable()
class AuditListener extends EventSourcing.EventListener {
    public async on(message: Domain.DomainMessage): Promise<void> {
        console.log(`[AUDIT] ${message.eventType} @ ${message.occurred.toISOString()}`);
    }
}

// Module configuration
const UserModule = new Framework.ModuleContext({
    services: new Map([
        ["user.readModel", { instance: ReadModel.InMemoryReadModelRepository }],

        // Projector subscribes to UserCreated
        [
            "user.projector",
            {
                instance: UserProjector,
                bus: "hollywood.infrastructure.eventBus.default",
                subscriber: [UserCreated]
            }
        ],

        // Listener receives all events
        [
            "audit.listener",
            {
                instance: AuditListener,
                bus: "hollywood.infrastructure.eventBus.default",
                listener: true
            }
        ]
    ])
});
```

## Key Interfaces

### DomainMessage

```typescript
class DomainMessage {
    readonly uuid: string;          // Aggregate ID
    readonly playhead: number;      // Event sequence number
    readonly event: DomainEvent;    // The domain event
    readonly eventType: string;     // Event class name
    readonly occurred: Date;        // When event occurred
    readonly metadata: any[];       // Optional metadata
}
```

### IEventListener

```typescript
interface IEventListener {
    on(message: DomainMessage): void | Promise<void>;
}
```

## Related Documentation

- [Creating Aggregates](./creating-aggregates.md) - Events originate from aggregates
- [Command & Query Handling](./command-query-handling.md) - Commands trigger events
- [Module Setup](./module-setup.md) - Full DI configuration
