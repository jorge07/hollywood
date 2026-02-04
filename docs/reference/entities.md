# Entities

Entities are domain objects defined by their identity rather than their attributes.

## What is an Entity?

From Domain-Driven Design:
> An object that is not defined by its attributes, but rather by a thread of continuity and its identity.

The key difference from Value Objects: **Entities have identity**.

## Entity vs Value Object

| Aspect | Entity | Value Object |
|--------|--------|--------------|
| Identity | Has unique ID | No identity |
| Equality | Equal by ID | Equal by attributes |
| Mutability | Can change over time | Immutable |
| Lifecycle | Created, modified, deleted | Created, replaced |

## Basic Example

```typescript
class Review {
    constructor(
        public readonly reviewId: string,  // Identity
        public readonly score: Score,
        public readonly comment: string,
        public readonly createdAt: Date,
    ) {}

    equals(other: Review): boolean {
        return this.reviewId === other.reviewId;
    }
}
```

Two reviews with the same score and comment are **not equal** unless they have the same `reviewId`.

## Entity with Behavior

```typescript
class Customer {
    private email: Email;
    private status: CustomerStatus;

    constructor(
        public readonly customerId: CustomerId,
        private username: Username,
        email: Email,
    ) {
        this.email = email;
        this.status = CustomerStatus.ACTIVE;
    }

    changeEmail(newEmail: Email): void {
        this.email = newEmail;
    }

    deactivate(): void {
        if (this.status === CustomerStatus.DEACTIVATED) {
            throw new Error("Customer is already deactivated");
        }
        this.status = CustomerStatus.DEACTIVATED;
    }

    getEmail(): Email {
        return this.email;
    }
}
```

## Event-Sourced Entities

In event-sourced systems, entities extend `EventSourced`:

```typescript
import { EventSourcing } from "hollywood-js";

class ShoppingCart extends EventSourcing.EventSourced {
    private items: CartItem[] = [];

    public applyItemAdded(event: ItemAdded): void {
        this.items.push(new CartItem(event.productId, event.quantity));
    }

    public applyItemRemoved(event: ItemRemoved): void {
        this.items = this.items.filter(item => item.productId !== event.productId);
    }

    public getTotalItems(): number {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
}
```

## Entity Identity

Identities should be value objects themselves:

```typescript
class OrderId {
    constructor(public readonly value: string) {
        if (!value || value.trim() === "") {
            throw new Error("OrderId cannot be empty");
        }
    }

    equals(other: OrderId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

class Order {
    constructor(
        public readonly orderId: OrderId,
        // ... other properties
    ) {}
}
```

## Entities Within Aggregates

Entities often exist as part of an aggregate:

```typescript
class Order {  // Aggregate Root
    private items: OrderItem[] = [];  // Child Entities

    addItem(productId: string, quantity: number, price: Price): void {
        const item = new OrderItem(
            generateId(),  // Unique identity
            productId,
            quantity,
            price
        );
        this.items.push(item);
    }
}

class OrderItem {  // Child Entity
    constructor(
        public readonly itemId: string,
        public readonly productId: string,
        public readonly quantity: number,
        public readonly price: Price,
    ) {}
}
```

## Best Practices

1. **Define clear identity**: Each entity needs a unique identifier
2. **Encapsulate state changes**: Don't expose internal state directly
3. **Enforce invariants**: Validate business rules in methods
4. **Use value objects**: For attributes without identity
5. **Keep entities focused**: One aggregate per transaction

---

**See also:** [Value Objects](value-objects.md) | [Aggregates](aggregates.md)
