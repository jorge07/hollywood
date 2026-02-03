# Hollywood-JS Framework Overview

## What is Hollywood-JS?

Hollywood-JS is a TypeScript framework for building modular, scalable server-side applications using:

- **CQRS** (Command Query Responsibility Segregation)
- **Event Sourcing**
- **Domain-Driven Design** (DDD)
- **Dependency Injection** (built on Inversify)

## Core Concepts

### CQRS (Command Query Responsibility Segregation)

Separates read and write operations:

- **Commands**: Mutate state, return void or error
- **Queries**: Read state, return data

```typescript
// Command - changes state
await kernel.app.handle(new CreateUserCommand(userId, email));

// Query - reads state
const user = await kernel.app.ask(new GetUserQuery(userId));
```

### Event Sourcing

Instead of storing current state, store a sequence of events:

1. Commands trigger domain events
2. Events are persisted to an EventStore
3. Aggregate state is reconstructed by replaying events
4. Snapshots optimize loading for aggregates with many events

### Bounded Contexts

Modules encapsulate business domains with clear boundaries:

```text
src/
├── user/           # User bounded context
│   ├── application/
│   │   ├── commands/
│   │   └── queries/
│   ├── domain/
│   │   ├── entities/
│   │   └── value-objects/
│   └── infrastructure/
├── order/          # Order bounded context
└── shared/         # Shared kernel
```

## Architecture Layers

### Application Layer

Entry point for all use cases. Contains:

- Command handlers (write operations)
- Query handlers (read operations)
- Middleware for cross-cutting concerns

### Domain Layer

Core business logic:

- **Aggregates**: Consistency boundaries for domain rules
- **Entities**: Objects with identity and lifecycle
- **Value Objects**: Immutable objects defined by attributes
- **Domain Events**: Facts that occurred in the domain

### Infrastructure Layer

Technical concerns:

- Repository implementations
- Event store adapters
- External service integrations

## Key Framework Components

| Component | Purpose | Source File |
|-----------|---------|-------------|
| `Kernel` | Application bootstrap and DI container | `src/Framework/Kernel.ts` |
| `ModuleContext` | Module configuration and dependencies | `src/Framework/Modules/ModuleContext.ts` |
| `App` | Command and query bus access | `src/Application/App.ts` |
| `EventSourcedAggregateRoot` | Base class for event-sourced aggregates | `src/Domain/EventSourcedAggregateRoot.ts` |
| `EventStore` | Persist and load aggregate event streams | `src/EventSourcing/EventStore.ts` |
| `EventBus` | Publish events to subscribers | `src/EventSourcing/EventBus/EventBus.ts` |
| `EventSubscriber` | React to specific domain events | `src/EventSourcing/EventBus/EventSubscriber.ts` |

## When to Use Hollywood-JS

**Good fit for:**

- Complex business domains with evolving requirements
- Systems requiring audit trails (event sourcing provides this naturally)
- Applications needing separate read/write scaling
- Microservices with clear domain boundaries
- Systems requiring temporal queries (what was the state at time X?)

**Not ideal for:**

- Simple CRUD applications
- Prototypes requiring rapid iteration
- Systems with very high write throughput to single aggregates
- Teams unfamiliar with DDD concepts

## Quick Start

```typescript
import "reflect-metadata";
import { Framework, Application } from "hollywood-js";

// 1. Define a command
class CreateUserCommand implements Application.ICommand {
    constructor(
        public readonly userId: string,
        public readonly email: string
    ) {}
}

// 2. Create handler with autowiring
@injectable()
class CreateUserHandler implements Application.ICommandHandler {
    constructor(@inject("user.repository") private readonly repo: UserRepository) {}

    @Application.autowiring
    async handle(command: CreateUserCommand): Promise<void> {
        const user = new User(command.userId, command.email);
        await this.repo.save(user);
    }
}

// 3. Configure module
const UserModule = new Framework.ModuleContext({
    commands: [CreateUserHandler],
    services: new Map([
        ["user.repository", { instance: InMemoryUserRepository }]
    ])
});

// 4. Bootstrap kernel
const kernel = await Framework.Kernel.createFromModuleContext(
    "dev",
    new Map(),
    UserModule
);

// 5. Execute command
await kernel.app.handle(new CreateUserCommand("user-1", "user@example.com"));
```

## Related Documentation

- [Creating Aggregates](./creating-aggregates.md) - Event-sourced aggregate implementation
- [Command & Query Handling](./command-query-handling.md) - CQRS implementation
- [Event Listeners](./event-listeners.md) - Subscribing to domain events
- [Module Setup](./module-setup.md) - Dependency injection and module configuration
