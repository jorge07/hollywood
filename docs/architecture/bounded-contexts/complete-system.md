# Complete System Architecture

This document provides comprehensive UML diagrams showing all Hollywood-JS framework components and their relationships across bounded contexts.

**Version**: 6.0.0-beta

## Full System Class Diagram

The diagram below shows the complete Hollywood-JS architecture across all layers.

```mermaid
classDiagram
    class Kernel {
        +string env
        +Container container
        +App app
    }

    class ModuleContext {
        +ModuleContext[] modules
        +ModuleConfig config
    }

    class App {
        -CommandBus commandBus
        -QueryBus queryBus
        +handle(command)
        +ask(query)
    }

    class MessageBus {
        <<abstract>>
        #Function middlewareChain
    }

    class CommandBus {
        +handle(command)
    }

    class QueryBus {
        +ask(query)
    }

    class IMiddleware {
        <<interface>>
        +execute(message, next)
    }

    class Saga {
        <<abstract>>
        -string sagaId
        #state
        +handleEvent(message)
        +complete()
        +fail(reason)
    }

    class SagaManager {
        -CommandBus commandBus
        +register()
        +on(message)
    }

    class AggregateRoot {
        <<abstract>>
        -aggregateRootId
    }

    class EventSourcedAggregateRoot {
        -number playhead
        -DomainMessage[] events
        +getUncommittedEvents()
        +fromHistory(stream)
        #raise(event)
    }

    class DomainEvent {
        <<interface>>
    }

    class DomainMessage {
        +uuid
        +playhead
        +event
        +eventType
    }

    class Repository {
        <<abstract>>
        -EventStore eventStore
        +save(aggregateRoot)
        +load(id)
    }

    class EventStore {
        -IEventStoreDBAL dbal
        -EventBus eventBus
        -SnapshotStore snapshotStore
        -UpcasterChain upcasterChain
        +load(id)
        +save(entity)
    }

    class IEventStoreDBAL {
        <<interface>>
        +load(id, from)
        +append(id, stream)
        +loadAll(fromPosition)
    }

    class InMemoryEventStore {
    }

    class EventBus {
        +publish(message)
        +attach(event, subscriber)
        +addListener(listener)
    }

    class DeadLetterAwareEventBus {
        -IDeadLetterQueue deadLetterQueue
        +publish(message)
    }

    class UpcasterChain {
        +register(upcaster)
        +upcast(event)
    }

    class EventListener {
        <<abstract>>
        +on(message)
    }

    class EventSubscriber {
        <<abstract>>
        +on(message)
        #registerHandler()
    }

    class SnapshotStore {
        +retrieve(id)
        +snapshot(entity)
    }

    class ConcurrencyException {
        <<Exception>>
        +aggregateId
        +expectedVersion
        +actualVersion
    }

    class Projector {
    }

    class ProjectionManager {
        -eventStore
        -positionStore
        +rebuild(projector)
        +catchUp(projector)
    }

    class InMemoryReadModelRepository {
        -collection
        +save(id, data)
        +oneOrFail(id)
        +find(criteria)
    }

    EventSourcedAggregateRoot --|> AggregateRoot
    CommandBus --|> MessageBus
    QueryBus --|> MessageBus
    InMemoryEventStore ..|> IEventStoreDBAL
    EventSubscriber ..|> EventListener
    DeadLetterAwareEventBus --|> EventBus
    SagaManager --|> EventListener
    Projector --|> EventSubscriber

    Kernel *-- App
    App *-- CommandBus
    App *-- QueryBus
    EventStore *-- IEventStoreDBAL
    EventStore *-- EventBus
    EventStore *-- SnapshotStore
    EventStore *-- UpcasterChain
    SagaManager *-- CommandBus

    Kernel ..> ModuleContext : builds from
    Repository ..> EventStore : uses
    EventStore ..> ConcurrencyException : throws
    EventBus ..> DomainMessage : publishes
    Projector ..> InMemoryReadModelRepository : updates
    SagaManager ..> Saga : manages
```

## Layer Dependency Flow

```mermaid
flowchart TB
    subgraph Framework["Framework Layer"]
        Kernel
        ModuleContext
        Container
    end

    subgraph Application["Application Layer"]
        App
        CommandBus
        QueryBus
        Handlers["Command/Query Handlers"]
    end

    subgraph Domain["Domain Layer"]
        AggregateRoot["EventSourcedAggregateRoot"]
        Repository
        Events["Domain Events"]
    end

    subgraph EventSourcing["Event Sourcing Layer"]
        EventStore
        EventBus
        SnapshotStore
        DBAL["DBAL Implementations"]
    end

    subgraph ReadModel["Read Model Layer"]
        Projector
        ReadModelRepo["ReadModel Repository"]
    end

    Framework --> Application
    Application --> Domain
    Domain --> EventSourcing
    EventSourcing --> ReadModel
    Application -.-> ReadModel

    style Framework fill:#e1f5fe
    style Application fill:#fff3e0
    style Domain fill:#f3e5f5
    style EventSourcing fill:#e8f5e9
    style ReadModel fill:#fce4ec
```

## Event Flow Sequence

```mermaid
sequenceDiagram
    participant Client
    participant App
    participant CommandBus
    participant Handler as CommandHandler
    participant Repo as Repository
    participant ES as EventStore
    participant DBAL as IEventStoreDBAL
    participant EB as EventBus
    participant Proj as Projector
    participant RM as ReadModelRepo

    Client->>App: handle(command)
    App->>CommandBus: handle(command)
    CommandBus->>Handler: handle(command)
    Handler->>Repo: save(aggregate)
    Repo->>ES: save(aggregate)
    ES->>ES: getUncommittedEvents()
    ES->>DBAL: append(events)
    ES->>ES: takeSnapshot() [if needed]

    loop For each event
        ES->>EB: publish(message)
        EB->>Proj: on(message)
        Proj->>RM: save(readModel)
    end

    Handler-->>Client: void
```

## Query Flow Sequence

```mermaid
sequenceDiagram
    participant Client
    participant App
    participant QueryBus
    participant Handler as QueryHandler
    participant RM as ReadModelRepo

    Client->>App: ask(query)
    App->>QueryBus: ask(query)
    QueryBus->>Handler: handle(query)
    Handler->>RM: oneOrFail(id)
    RM-->>Handler: readModel
    Handler-->>Client: IAppResponse
```

## Component Interaction Matrix

| Component | Creates | Uses | Is Used By |
|-----------|---------|------|------------|
| **Kernel** | App, Container | ModuleContext | Entry point |
| **App** | CommandBus, QueryBus | Handlers | Client code |
| **CommandBus** | - | Middleware chain | App, SagaManager |
| **QueryBus** | - | Middleware chain | App |
| **CommandHandler** | - | Repository | CommandBus |
| **QueryHandler** | - | ReadModelRepository | QueryBus |
| **Repository** | - | EventStore | Handlers |
| **EventStore** | - | DBAL, EventBus, SnapshotStore, UpcasterChain | Repository |
| **EventBus** | - | Subscribers, Listeners | EventStore |
| **DeadLetterAwareEventBus** | DeadLetterMessage | DLQ, RetryPolicy | EventStore (v6) |
| **IdempotentEventBus** | - | IdempotencyStore | EventStore (v6) |
| **UpcasterChain** | - | EventUpcasters | EventStore (v6) |
| **Projector** | - | ReadModelRepository | EventBus |
| **ProjectionManager** | - | EventStoreDBAL, PositionStore | Admin operations (v6) |
| **Saga** | Commands | State | SagaManager (v6) |
| **SagaManager** | Saga instances | CommandBus, SagaRepository | EventBus (v6) |
| **EventSourcedAggregateRoot** | DomainMessage | - | Repository, EventStore |

## Aggregate Boundaries

```mermaid
graph TB
    subgraph FrameworkAggregate["Framework Aggregate"]
        Kernel["Kernel (Root)"]
        Container
        ModuleContext
    end

    subgraph AppAggregate["Application Aggregate"]
        App["App (Root)"]
        CommandBus
        QueryBus
        Resolvers["Resolvers"]
    end

    subgraph DomainAggregate["Domain Aggregate (per bounded context)"]
        AR["EventSourcedAggregateRoot (Root)"]
        Entities["EventSourced Entities"]
        Events["Domain Events"]
    end

    subgraph ESAggregate["EventStore Aggregate (per aggregate type)"]
        ES["EventStore (Root)"]
        EB["EventBus"]
        SS["SnapshotStore"]
    end

    FrameworkAggregate --> AppAggregate
    AppAggregate --> DomainAggregate
    DomainAggregate --> ESAggregate
```

## Technology Integration Points

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Inversify | Dependency injection |
| Framework | reflect-metadata | Decorator metadata |
| Application | TypeScript | Type safety |
| Domain | ES6 Classes | OOP abstractions |
| Event Sourcing | Promise/async-await | Async operations |
| Read Model | In-memory objects | Simple storage |

## Extension Points

1. **Custom Middleware**: Implement `IMiddleware<TMessage, TResponse>` for command/query buses
2. **Custom DBAL**: Implement `IEventStoreDBAL` for different databases
3. **Custom Snapshot DBAL**: Implement `ISnapshotStoreDBAL` for snapshot storage
4. **Custom Projectors**: Extend `EventSubscriber` (Projector type alias) for read model updates
5. **Custom Listeners**: Extend `EventListener` for global event handling
6. **Custom Modules**: Create `ModuleContext` instances for feature modules
7. **Custom Event Upcasters** (v6): Implement `EventUpcaster<T>` for schema migrations
8. **Custom Dead Letter Queue** (v6): Implement `IDeadLetterQueue` for failed event storage
9. **Custom Idempotency Store** (v6): Implement `IIdempotencyStore` for duplicate detection
10. **Custom Saga Repository** (v6): Implement `ISagaRepository` for saga persistence
11. **Custom Projection Position Store** (v6): Implement `IProjectionPositionStore` for rebuild tracking
12. **Custom Sagas** (v6): Extend `Saga<TState>` for workflow orchestration
