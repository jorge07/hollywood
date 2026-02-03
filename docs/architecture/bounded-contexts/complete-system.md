# Complete System Architecture

This document provides comprehensive UML diagrams showing all Hollywood-JS framework components and their relationships across bounded contexts.

## Full System Class Diagram

```mermaid
classDiagram
    %% =====================================================
    %% FRAMEWORK LAYER - Composition Root
    %% =====================================================
    namespace FrameworkLayer {
        class Kernel {
            <<AggregateRoot>>
            +string env
            +Container container
            +App app
            +Promise~Kernel~ createFromModuleContext(env, params, context)$
        }

        class ModuleContext {
            +ModuleContext[] modules
            +ModuleConfig config
            +Promise~void~ load(Container container)
        }

        class SERVICES_ALIAS {
            <<Constants>>
            +string COMMAND_HANDLERS$
            +string QUERY_HANDLERS$
            +string DEFAULT_EVENT_BUS$
            +string DEFAULT_EVENT_STORE_DBAL$
        }
    }

    %% =====================================================
    %% APPLICATION LAYER - CQRS
    %% =====================================================
    namespace ApplicationLayer {
        class App {
            <<AggregateRoot>>
            -CommandBus commandBus
            -QueryBus queryBus
            +Promise~void~ handle(ICommand command)
            +Promise~IAppResponse~ ask(IQuery query)
        }

        class MessageBus {
            <<abstract>>
            #Function middlewareChain
        }

        class CommandBus {
            +Promise~void~ handle(ICommand command)
        }

        class QueryBus {
            +Promise~QueryBusResponse~ ask(IQuery query)
        }

        class IMiddleware {
            <<interface>>
            +any execute(command, next)
        }

        class CommandHandlerResolver {
            -ICommandRegistry handlers
            +execute(command, next)
        }

        class QueryHandlerResolver {
            -IQueryRegistry handlers
            +execute(command, next)
        }

        class ICommand {
            <<interface>>
        }

        class IQuery {
            <<interface>>
        }

        class ICommandHandler {
            <<interface>>
            +Promise~void~ handle(ICommand)
        }

        class IQueryHandler {
            <<interface>>
            +Promise~IAppResponse~ handle(IQuery)
        }

        class IAppResponse {
            <<ValueObject>>
            +any data
            +any[] meta
        }

        class IAppError {
            <<ValueObject>>
            +string message
            +number code
        }
    }

    %% =====================================================
    %% DOMAIN LAYER - Event Sourcing Core
    %% =====================================================
    namespace DomainLayer {
        class AggregateRoot {
            <<abstract>>
            -AggregateRootId aggregateRootId
            +AggregateRootId getAggregateRootId()
        }

        class EventSourcedAggregateRoot {
            <<AggregateRoot>>
            -number playhead
            -DomainMessage[] events
            -EventSourced[] children
            +DomainEventStream getUncommittedEvents()
            +fromHistory(DomainEventStream stream)
            +fromSnapshot(snapshot)
            #void raise(DomainEvent event)
        }

        class EventSourced {
            <<abstract>>
            -EventSourced[] children
            +fromSnapshot(snapshot)
            +recursiveHandling(event, method)
        }

        class IEventSourced {
            <<interface>>
            +fromSnapshot(snapshot)
            +recursiveHandling(event, method)
        }

        class DomainEvent {
            <<interface>>
            %% Marker interface - event type determined by constructor.name
        }

        class DomainMessage {
            <<ValueObject>>
            +AggregateRootId uuid
            +number playhead
            +DomainEvent event
            +Date occurred
            +string eventType
            +DomainMessage create(uuid, playhead, event)$
        }

        class DomainEventStream {
            <<ValueObject>>
            +DomainMessage[] events
            +StreamName name
            +bool isEmpty()
        }

        class IRepository~T~ {
            <<interface>>
            +Promise~void~ save(T aggregateRoot)
            +Promise~T~ load(string id)
        }

        class Repository~T~ {
            <<abstract>>
            -EventStore~T~ eventStore
            +Promise~void~ save(T aggregateRoot)
            +Promise~T~ load(string id)
        }

        class AggregateRootId {
            <<ValueObject>>
            string
        }

        class StreamName {
            <<ValueObject>>
            string
        }
    }

    %% =====================================================
    %% EVENT SOURCING LAYER - Infrastructure
    %% =====================================================
    namespace EventSourcingLayer {
        class EventStore~T~ {
            <<AggregateRoot>>
            -IEventStoreDBAL dbal
            -EventBus eventBus
            -SnapshotStore~T~ snapshotStore
            +Promise~T~ load(AggregateRootId id)
            +Promise~void~ save(T entity)
            +Promise~void~ replayFrom(uuid, from, to)
        }

        class IEventStoreDBAL {
            <<interface>>
            +Promise~DomainEventStream~ load(id, from)
            +Promise~DomainEventStream~ loadFromTo(id, from, to)
            +void append(id, stream)
        }

        class InMemoryEventStore {
            -Object events
            +load(aggregateId, from)
            +loadFromTo(aggregateId, from, to)
            +append(aggregateId, stream)
        }

        class EventBus {
            -ISubscriberRegistry subscribersRegistry
            -IListenersRegistry listenersRegistry
            +Promise~void~ publish(DomainMessage message)
            +EventBus attach(event, EventSubscriber subscriber)
            +EventBus addListener(EventListener listener)
        }

        class IEventListener {
            <<interface>>
            +void on(DomainMessage message)
        }

        class EventListener {
            <<abstract>>
            +void on(DomainMessage message)
        }

        class EventSubscriber {
            <<abstract>>
            +Promise~void~ on(DomainMessage message)
        }

        class SnapshotStore~T~ {
            -ISnapshotStoreDBAL store
            +Promise~any~ retrieve(AggregateRootId id)
            +Promise~void~ snapshot(T entity)
        }

        class ISnapshotStoreDBAL {
            <<interface>>
            +Promise~any~ get(uuid)
            +Promise~void~ store(entity)
        }

        class InMemorySnapshotStoreDBAL {
            +snapshots
            +get(uuid)
            +store(entity)
        }

        class AggregateRootNotFoundException {
            <<Exception>>
        }
    }

    %% =====================================================
    %% READ MODEL LAYER - Projections
    %% =====================================================
    namespace ReadModelLayer {
        class Projector {
            <<abstract>>
        }

        class InMemoryReadModelRepository {
            -Object collection
            +void save(string id, any data)
            +any oneOrFail(string id)
            +any find(Function criteria)
        }
    }

    %% =====================================================
    %% INHERITANCE RELATIONSHIPS
    %% =====================================================
    EventSourcedAggregateRoot --|> AggregateRoot
    EventSourcedAggregateRoot ..|> IEventSourced
    EventSourced ..|> IEventSourced
    Repository ..|> IRepository

    CommandBus --|> MessageBus
    QueryBus --|> MessageBus
    CommandHandlerResolver ..|> IMiddleware
    QueryHandlerResolver ..|> IMiddleware

    InMemoryEventStore ..|> IEventStoreDBAL
    InMemorySnapshotStoreDBAL ..|> ISnapshotStoreDBAL
    EventListener ..|> IEventListener
    EventSubscriber ..|> IEventListener

    Projector --|> EventSubscriber

    %% =====================================================
    %% COMPOSITION RELATIONSHIPS
    %% =====================================================
    Kernel *-- App
    App *-- CommandBus
    App *-- QueryBus
    App *-- CommandHandlerResolver
    App *-- QueryHandlerResolver

    EventSourcedAggregateRoot *-- DomainMessage
    EventSourcedAggregateRoot *-- EventSourced
    DomainEventStream *-- DomainMessage

    EventStore *-- IEventStoreDBAL
    EventStore *-- EventBus
    EventStore *-- SnapshotStore
    SnapshotStore *-- ISnapshotStoreDBAL

    %% =====================================================
    %% DEPENDENCY RELATIONSHIPS
    %% =====================================================
    Kernel ..> ModuleContext : builds from
    Repository ..> EventStore : uses
    EventStore ..> DomainEventStream : processes
    EventStore ..> EventSourcedAggregateRoot : manages
    EventBus ..> DomainMessage : publishes
    EventBus ..> Projector : notifies
    Projector ..> InMemoryReadModelRepository : updates
    IQueryHandler ..> InMemoryReadModelRepository : queries
    ICommandHandler ..> Repository : uses
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
| **CommandBus** | - | Middleware chain | App |
| **QueryBus** | - | Middleware chain | App |
| **CommandHandler** | - | Repository | CommandBus |
| **QueryHandler** | - | ReadModelRepository | QueryBus |
| **Repository** | - | EventStore | Handlers |
| **EventStore** | - | DBAL, EventBus, SnapshotStore | Repository |
| **EventBus** | - | Subscribers, Listeners | EventStore |
| **Projector** | - | ReadModelRepository | EventBus |
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

1. **Custom Middleware**: Implement `IMiddleware` for command/query buses
2. **Custom DBAL**: Implement `IEventStoreDBAL` for different databases
3. **Custom Snapshot DBAL**: Implement `ISnapshotStoreDBAL` for snapshot storage
4. **Custom Projectors**: Extend `Projector` for read model updates
5. **Custom Listeners**: Extend `EventListener` for global event handling
6. **Custom Modules**: Create `ModuleContext` instances for feature modules
