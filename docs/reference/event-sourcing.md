# Event Sourcing

Event Sourcing stores state as a sequence of events rather than current state. Hollywood provides built-in event sourcing capabilities.

## Overview

Hollywood's EventSourcing module includes:
- EventSourced entity abstraction
- EventSourcedAggregateRoot entity abstraction
- Event Store with DBAL interface
- Snapshot Store for performance
- Event Bus with Listeners and Subscribers

## Events

Events extend `DomainEvent`:

```typescript
import { Domain } from "hollywood-js";

export class CustomerCreated extends Domain.DomainEvent {
    constructor(
        public readonly customerId: string,
        public readonly username: string
    ) {
        super();
    }
}

export class CustomerEmailChanged extends Domain.DomainEvent {
    constructor(
        public readonly customerId: string,
        public readonly newEmail: string
    ) {
        super();
    }
}
```

## EventSourced Entities

Child entities within an aggregate extend `EventSourced`:

```typescript
import { EventSourcing } from "hollywood-js";

class Address extends EventSourcing.EventSourced {
    public street: string = "";
    public city: string = "";

    public applyAddressChanged(event: AddressChanged) {
        this.street = event.street;
        this.city = event.city;
    }
}
```

## EventSourcedAggregateRoot

The aggregate root manages the event stream:

```typescript
import { EventSourcing } from "hollywood-js";

class Customer extends EventSourcing.EventSourcedAggregateRoot {
    public username: string = "";
    public email: string = "";

    constructor(id: string) {
        super(id);
    }

    public static create(id: string, username: string): Customer {
        const customer = new Customer(id);
        customer.raise(new CustomerCreated(id, username));
        return customer;
    }

    public changeEmail(newEmail: string): void {
        this.raise(new CustomerEmailChanged(this.getAggregateRootId(), newEmail));
    }

    // Event apply methods
    public applyCustomerCreated(event: CustomerCreated): void {
        this.username = event.username;
    }

    public applyCustomerEmailChanged(event: CustomerEmailChanged): void {
        this.email = event.newEmail;
    }
}
```

When `raise()` is called, the entity looks for methods prefixed with `apply` matching the event name.

## Event Store

The EventStore persists and loads aggregates:

```typescript
import { EventSourcing } from "hollywood-js";

const eventStore = new EventSourcing.EventStore<Customer>(
    Customer,
    new EventSourcing.InMemoryEventStore(),
    eventBus
);

// Create and save
const customer = Customer.create("uuid-123", "john_doe");
await eventStore.save(customer);

// Load from events
const loadedCustomer = await eventStore.load("uuid-123");
console.log(loadedCustomer.username); // "john_doe"
```

## Custom DBAL

Implement `IEventStoreDBAL` for production databases:

```typescript
// Example: PostgreSQL EventStore DBAL
// See: https://github.com/jorge07/billing-api/blob/master/src/Billing/Shared/Infrastructure/EventStore/DBAL.ts
```

## Snapshot Store

For aggregates with many events, snapshots reduce load time:

```typescript
const eventStore = new EventSourcing.EventStore<Customer>(
    Customer,
    eventStoreDBAL,
    eventBus,
    snapshotStore,  // Optional snapshot store
    10              // Snapshot every 10 events
);
```

With 300 events and a margin of 10:
- Without snapshots: Apply 300 events
- With snapshots: Load snapshot + apply ~10 events

## Child Entities

Register child entities to receive events:

```typescript
class Order extends EventSourcing.EventSourcedAggregateRoot {
    private readonly items: OrderItems;

    constructor(id: string) {
        super(id);
        this.items = new OrderItems();
        this.registerChildren(this.items);  // Register child
    }
}

class OrderItems extends EventSourcing.EventSourced {
    public items: OrderItem[] = [];

    public applyItemAdded(event: ItemAdded): void {
        this.items.push(new OrderItem(event.productId, event.quantity));
    }
}
```

## Module Configuration

```typescript
const services = new Map()
    .set("customer.eventStore", {
        eventStore: Customer,  // Shorthand configuration
    })
    // Or full configuration:
    .set("customer.eventStore.full", {
        instance: EventSourcing.EventStore,
        deps: [
            { use: () => Customer },
            "customer.eventStore.dbal",
            SERVICES_ALIAS.DEFAULT_EVENT_BUS,
            "customer.snapshotStore",
            { use: () => 10 },
        ],
    });
```

---

**See also:** [Events](../basics/events.md) | [Aggregates](aggregates.md)
