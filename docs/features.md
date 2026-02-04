# Features

## Core Features

- **Dependency Injection** (Built around Inversify)
    - Module hierarchy for better isolation
    - Bounded context architecture
- **DDD Toolbox**
    - Event Driven architecture
    - Support for different event streams
    - In Memory implementations for testing
    - AggregateRoot and EventSourced abstractions
- **Event Store**
    - Event Store decoupled from storage via DBAL (Database Abstraction Layer)
    - In Memory Event Store DBAL for testing
    - Configurable SnapshotStore support
    - In Memory Snapshot DBAL for testing
    - Built-in Event Bus with Listeners and Subscribers
- **Command and Query Bus (CQRS)**
    - Command and Query handlers autowiring
    - Middlewares support for Command and Query bus

## v6 Features

- **Sagas & Process Managers**
    - Coordinate long-running workflows across aggregates
    - Compensation handlers for rollback on failure
    - Idempotent event processing
    - Persistence support via ISagaRepository
- **Event Versioning & Upcasting**
    - Evolve event schemas without data migrations
    - UpcasterChain for automatic version transitions
    - Transparent migration at read time
- **Dead Letter Queue**
    - Capture and retry failed events
    - Configurable retry policies with exponential backoff
    - Inspect and debug failures
- **Idempotency Support**
    - Prevent duplicate event processing
    - IdempotentEventBus with configurable TTL
- **Optimistic Locking**
    - Detect concurrent modifications
    - ConcurrencyException for version conflicts
- **Projection Rebuild**
    - ProjectionManager for rebuilding read models
    - Position tracking for incremental updates
    - Catch-up from last processed position
- **TypeScript 5.9**
    - Generic type-safe middleware
    - Improved type inference

## Design Philosophy

- Libraries should NOT log - we throw Errors
- Not a server framework but tested with Express and Fastify (see /examples)
