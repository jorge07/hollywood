# Creating Event-Sourced Aggregates

## Overview

Aggregates in Hollywood-JS are event-sourced entities that:

1. Emit domain events when state changes
2. Apply events to mutate internal state
3. Can be reconstructed from event history

**Source files:**

- `src/Domain/EventSourcedAggregateRoot.ts`
- `src/Domain/EventSourced.ts`
- `src/Domain/Event/DomainEvent.ts`

## Step 1: Define Domain Events

Events are immutable facts. Name them in past tense.

```typescript
import type { Domain } from "hollywood-js";

// Events implement DomainEvent marker interface
class OrderCreated implements Domain.DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly customerId: string,
        public readonly createdAt: Date
    ) {}
}

class ItemAdded implements Domain.DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly itemId: string,
        public readonly quantity: number,
        public readonly price: number
    ) {}
}

class OrderShipped implements Domain.DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly shippedAt: Date
    ) {}
}
```

## Step 2: Create the Aggregate

Extend `EventSourcedAggregateRoot` and register handlers in the constructor.

```typescript
import { Domain } from "hollywood-js";

class Order extends Domain.EventSourcedAggregateRoot {
    private customerId: string = "";
    private items: Map<string, { quantity: number; price: number }> = new Map();
    private status: "pending" | "shipped" = "pending";

    constructor(orderId: string) {
        super(orderId);

        // Register event handlers explicitly (preferred pattern)
        this.registerHandler(OrderCreated, (e) => this.onOrderCreated(e));
        this.registerHandler(ItemAdded, (e) => this.onItemAdded(e));
        this.registerHandler(OrderShipped, (e) => this.onOrderShipped(e));
    }

    // Factory method for creating new orders
    public static create(orderId: string, customerId: string): Order {
        const order = new Order(orderId);
        order.raise(new OrderCreated(orderId, customerId, new Date()));
        return order;
    }

    // Command methods that raise events
    public addItem(itemId: string, quantity: number, price: number): void {
        if (this.status === "shipped") {
            throw new Error("Cannot add items to shipped order");
        }
        this.raise(new ItemAdded(this.getAggregateRootId(), itemId, quantity, price));
    }

    public ship(): void {
        if (this.items.size === 0) {
            throw new Error("Cannot ship empty order");
        }
        this.raise(new OrderShipped(this.getAggregateRootId(), new Date()));
    }

    // Event handlers - mutate state
    private onOrderCreated(event: OrderCreated): void {
        this.customerId = event.customerId;
    }

    private onItemAdded(event: ItemAdded): void {
        this.items.set(event.itemId, {
            quantity: event.quantity,
            price: event.price
        });
    }

    private onOrderShipped(event: OrderShipped): void {
        this.status = "shipped";
    }

    // Read methods
    public getTotal(): number {
        let total = 0;
        this.items.forEach(item => {
            total += item.quantity * item.price;
        });
        return total;
    }
}
```

## Handler Registration Patterns

### Explicit Handler Registration (Recommended)

Register handlers in the constructor using `registerHandler()`:

```typescript
constructor(id: string) {
    super(id);
    this.registerHandler(OrderCreated, (e) => this.onOrderCreated(e));
    this.registerHandler(ItemAdded, (e) => this.onItemAdded(e));
}
```

**Benefits:**

- Type-safe event handling
- Throws error if event has no handler (fail-fast)
- Clear, explicit event-to-handler mapping

**Behavior:** When handlers are registered, the aggregate operates in "strict mode". An error is thrown if an event has no registered handler.

### Legacy Pattern (Backwards Compatible)

Use `apply{EventName}` methods:

```typescript
class LegacyOrder extends Domain.EventSourcedAggregateRoot {
    private customerId: string = "";

    constructor(id: string) {
        super(id);
        // No explicit registration needed
    }

    // Handler discovered via reflection
    public applyOrderCreated(event: OrderCreated): void {
        this.customerId = event.customerId;
    }
}
```

**Behavior:** Events without handlers are silently ignored.

**Warning:** Do not mix patterns. If you register any handler explicitly, the aggregate enters strict mode and legacy methods are ignored.

## Child Entities

For complex aggregates, use child `EventSourced` entities:

```typescript
import { Domain } from "hollywood-js";

class OrderItem extends Domain.EventSourced {
    public quantity: number = 0;
    public price: number = 0;

    constructor() {
        super();
        this.registerHandler(ItemAdded, (e) => this.onItemAdded(e));
    }

    private onItemAdded(event: ItemAdded): void {
        this.quantity = event.quantity;
        this.price = event.price;
    }
}

class Order extends Domain.EventSourcedAggregateRoot {
    private readonly itemTracker: OrderItem;

    constructor(orderId: string) {
        super(orderId);

        // Register child entity
        this.itemTracker = new OrderItem();
        this.registerChildren(this.itemTracker);

        // Register handlers
        this.registerHandler(ItemAdded, (e) => this.onItemAdded(e));
    }

    private onItemAdded(event: ItemAdded): void {
        // Parent handles event
        // Child also receives event automatically via recursive handling
    }
}
```

Events propagate recursively to all child entities registered via `registerChildren()`.

## Step 3: Create Repository

Repositories wrap the EventStore for aggregate persistence:

```typescript
import { Domain, EventSourcing } from "hollywood-js";

class OrderRepository extends Domain.Repository<Order> {
    constructor(eventStore: EventSourcing.EventStore<Order>) {
        super(eventStore);
    }
}
```

The base `Repository` provides:

- `save(aggregate)`: Persist uncommitted events
- `load(aggregateId)`: Reconstruct aggregate from events

## Complete Example

```typescript
import { Domain, EventSourcing } from "hollywood-js";

// Domain Event
class OrderCreated implements Domain.DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly customerId: string
    ) {}
}

// Aggregate
class Order extends Domain.EventSourcedAggregateRoot {
    private customerId: string = "";

    constructor(id: string) {
        super(id);
        this.registerHandler(OrderCreated, (e) => this.onOrderCreated(e));
    }

    public static create(orderId: string, customerId: string): Order {
        const order = new Order(orderId);
        order.raise(new OrderCreated(orderId, customerId));
        return order;
    }

    private onOrderCreated(event: OrderCreated): void {
        this.customerId = event.customerId;
    }

    public getCustomerId(): string {
        return this.customerId;
    }
}

// Repository
class OrderRepository extends Domain.Repository<Order> {
    constructor(eventStore: EventSourcing.EventStore<Order>) {
        super(eventStore);
    }
}

// Usage
const eventBus = new EventSourcing.EventBus();
const eventStoreDBAL = new EventSourcing.InMemoryEventStore();
const eventStore = new EventSourcing.EventStore(Order, eventStoreDBAL, eventBus);
const repository = new OrderRepository(eventStore);

// Create and save
const order = Order.create("order-1", "customer-1");
await repository.save(order);

// Load and verify
const loaded = await repository.load("order-1");
console.log(loaded.getCustomerId()); // "customer-1"
console.log(loaded.version()); // 0
```

## Key Methods Reference

| Method | Purpose |
|--------|---------|
| `raise(event)` | Record event and apply to state |
| `registerHandler(EventClass, handler)` | Register explicit event handler |
| `registerChildren(child)` | Add child entity for event propagation |
| `getUncommittedEvents()` | Get events not yet persisted |
| `fromHistory(stream)` | Reconstruct state from event stream |
| `fromSnapshot(snapshot)` | Reconstruct from snapshot |
| `version()` | Current playhead position |
| `getAggregateRootId()` | Get aggregate identifier |

## Related Documentation

- [Command & Query Handling](./command-query-handling.md) - Using aggregates in handlers
- [Event Listeners](./event-listeners.md) - Reacting to aggregate events
- [Module Setup](./module-setup.md) - Configuring EventStore in DI
