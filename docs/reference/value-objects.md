# Value Objects

Value Objects represent concepts in your domain that are defined by their attributes, not by identity.

## What is a Value Object?

From Domain-Driven Design:
> A small object that represents a simple entity whose equality is not based on identity. Two value objects are equal when they have the same value, not necessarily being the same object.

Examples: Price, Email, Password, DateTime, Username, Address

## Characteristics

1. **No identity**: Equality based on attributes, not ID
2. **Immutable**: Cannot be changed after creation
3. **Self-validating**: Encapsulate their own validation rules
4. **Replaceable**: Replace entirely rather than modify

## Basic Example

```typescript
class Price {
    constructor(
        public readonly amount: number,
        public readonly currency: string
    ) {
        if (amount < 0) {
            throw new Error("Price cannot be negative");
        }
        if (!["USD", "EUR", "GBP"].includes(currency)) {
            throw new Error(`Invalid currency: ${currency}`);
        }
    }

    equals(other: Price): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }

    add(other: Price): Price {
        if (this.currency !== other.currency) {
            throw new Error("Cannot add prices with different currencies");
        }
        return new Price(this.amount + other.amount, this.currency);
    }
}
```

## Validation Example

A Password with multiple rules:

```typescript
class Password {
    public readonly hashedPassword: string;

    constructor(plainPassword: string) {
        Password.atLeast6Characters(plainPassword);
        Password.atLeast1Number(plainPassword);
        Password.noConsecutiveNumbers(plainPassword);
        Password.noMoreThan120Characters(plainPassword);
        this.hashedPassword = hash(plainPassword);
    }

    private static atLeast6Characters(password: string): void {
        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }
    }

    private static atLeast1Number(password: string): void {
        if (!/\d/.test(password)) {
            throw new Error("Password must contain at least 1 number");
        }
    }

    private static noConsecutiveNumbers(password: string): void {
        if (/\d{2}/.test(password)) {
            throw new Error("Password cannot contain consecutive numbers");
        }
    }

    private static noMoreThan120Characters(password: string): void {
        if (password.length > 120) {
            throw new Error("Password cannot exceed 120 characters");
        }
    }
}
```

## Identity Value Objects

Value objects can represent entity identities:

```typescript
class CustomerId {
    constructor(public readonly value: string) {
        if (!CustomerId.isValidUuid(value)) {
            throw new Error("CustomerId must be a valid UUID");
        }
    }

    private static isValidUuid(value: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }

    equals(other: CustomerId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
```

## Factory Methods

Use factory methods for clarity:

```typescript
class Username {
    public readonly value: string;

    public static fromLiteral(username: string): Username {
        return new Username(username);
    }

    private constructor(username: string) {
        Username.validate(username);
        this.value = username;
    }

    private static validate(username: string): void {
        if (username.length < 3) {
            throw new InvalidUsername(username, "Username must be at least 3 characters");
        }
        if (username.length > 50) {
            throw new InvalidUsername(username, "Username cannot exceed 50 characters");
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            throw new InvalidUsername(username, "Username can only contain alphanumeric characters and underscores");
        }
    }
}
```

## Using Value Objects in Commands

Validate early in command constructors:

```typescript
import { Application } from "hollywood-js";

class CreateCustomer implements Application.ICommand {
    public readonly username: Username;
    public readonly email: Email;

    constructor(
        public readonly customerId: string,
        username: string,
        email: string,
    ) {
        this.username = Username.fromLiteral(username);
        this.email = Email.fromLiteral(email);
    }
}
```

This ensures invalid data fails immediately, before reaching handlers.

## Best Practices

1. **Fail fast**: Validate in constructor
2. **Be immutable**: Don't provide setters
3. **Encapsulate logic**: Put related behavior in the value object
4. **Use factory methods**: Clearer creation intent
5. **Implement equality**: Define what "equal" means

---

**See also:** [Entities](entities.md) | [Aggregates](aggregates.md)
