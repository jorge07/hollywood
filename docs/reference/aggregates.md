# Aggregates

An Aggregate is a cluster of domain objects treated as a single unit for data changes.

## What is an Aggregate?

From Domain-Driven Design:
> A group of objects bound together by a root entity (the aggregate root). Objects outside the aggregate can only reference the root, not other objects within it.

The aggregate root ensures consistency of changes within the aggregate.

## Aggregate Components

### Value Objects

Objects without identity, defined by their attributes:

```typescript
class Score {
    constructor(public readonly value: number) {
        if (value < 0 || value > 10) {
            throw new Error("Score must be between 0 and 10");
        }
    }
}

class GlassesType {
    private static readonly VALID_TYPES = ["FAKE", "SUN", "SAFETY", "NORMAL"];

    constructor(public readonly value: string) {
        if (!GlassesType.VALID_TYPES.includes(value)) {
            throw new Error(`Invalid type: ${value}`);
        }
    }
}
```

### Entities

Objects with identity:

```typescript
class Review {
    constructor(
        public readonly reviewId: string,  // Identity
        public readonly score: Score,
    ) {}
}
```

### Aggregate Root

The entry point for all operations:

```typescript
class Glasses {
    private constructor(
        public readonly glassesId: string,
        public readonly name: string,
        public readonly brand: string,
        public readonly type: GlassesType,
        private reviews: Review[]
    ) {}

    public static create(
        glassesId: string,
        name: string,
        brand: string,
        type: GlassesType,
    ): Glasses {
        return new Glasses(glassesId, name, brand, type, []);
    }

    public addReview(review: Review): void {
        this.reviews.push(review);
    }

    public getAverageScore(): number {
        if (this.reviews.length === 0) return 0;

        const total = this.reviews.reduce((sum, r) => sum + r.score.value, 0);
        return total / this.reviews.length;
    }
}
```

## Aggregate Rules

1. **Single entry point**: Only the root can be referenced externally
2. **Transactional consistency**: Changes within an aggregate are atomic
3. **Identity**: The root has a unique identifier
4. **Invariant enforcement**: The root ensures all business rules

## Event-Sourced Aggregates

Hollywood provides `EventSourcedAggregateRoot` for event-sourced aggregates:

```typescript
import { EventSourcing } from "hollywood-js";

class Customer extends EventSourcing.EventSourcedAggregateRoot {
    public username: string = "";

    constructor(id: string) {
        super(id);
    }

    public static create(id: string, username: string): Customer {
        const customer = new Customer(id);
        customer.raise(new CustomerCreated(id, username));
        return customer;
    }

    public applyCustomerCreated(event: CustomerCreated): void {
        this.username = event.username;
    }
}
```

## Child Entities in Event-Sourced Aggregates

Register child entities to receive events:

```typescript
class Order extends EventSourcing.EventSourcedAggregateRoot {
    private readonly shipping: ShippingDetails;

    constructor(id: string) {
        super(id);
        this.shipping = new ShippingDetails();
        this.registerChildren(this.shipping);
    }
}

class ShippingDetails extends EventSourcing.EventSourced {
    public address: string = "";

    public applyShippingAddressSet(event: ShippingAddressSet): void {
        this.address = event.address;
    }
}
```

## Repository Pattern

Aggregates are loaded and saved through repositories:

```typescript
interface CustomerRepository {
    findById(id: string): Promise<Customer | null>;
    save(customer: Customer): Promise<void>;
}

// Event-sourced implementation
class EventSourcedCustomerRepository implements CustomerRepository {
    constructor(private readonly eventStore: EventStore<Customer>) {}

    async findById(id: string): Promise<Customer | null> {
        try {
            return await this.eventStore.load(id);
        } catch {
            return null;
        }
    }

    async save(customer: Customer): Promise<void> {
        await this.eventStore.save(customer);
    }
}
```

---

**See also:** [Value Objects](value-objects.md) | [Entities](entities.md) | [Event Sourcing](event-sourcing.md)
