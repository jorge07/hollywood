# Event Sourcing Layer - Infrastructure Bounded Context

This document describes the Event Sourcing Layer of the Hollywood-JS framework, which provides the infrastructure for persisting and distributing domain events.

**Version**: 6.0.0-beta

## Overview

The Event Sourcing Layer implements the persistence and publication mechanisms for event-sourced aggregates. It includes the EventStore for event persistence, EventBus for event distribution, and SnapshotStore for aggregate state caching.

### v6-beta Changes
- **Event Versioning and Upcasting**: UpcasterChain for event schema evolution
- **Dead Letter Queue**: DeadLetterAwareEventBus with RetryPolicy for failed event handling
- **Idempotency**: IdempotentEventBus and IIdempotencyStore for duplicate prevention
- **Optimistic Locking**: ConcurrencyException and version-based conflict detection
- **EventSubscriber explicit registration**: `registerHandler()` for type-safe event handling

## UML Class Diagram

```mermaid
classDiagram
    class EventStore {
        -IEventStoreDBAL dbal
        -EventBus eventBus
        -SnapshotStore snapshotStore
        -UpcasterChain upcasterChain
        -modelConstructor
        -number snapshotMargin
        +load(aggregateRootId) Promise
        +save(entity) Promise
        +append(aggregateId, stream) Promise
        +replayFrom(uuid, from, to) Promise
        -takeSnapshot(entity) Promise
        -isSnapshotNeeded(version) bool
        -fromSnapshot(aggregateRootId) Promise
        -aggregateFactory(aggregateRootId)
        -upcastStream(stream)
    }

    class IEventStoreDBAL {
        <<interface>>
        +load(aggregateId, from) Promise
        +loadFromTo(aggregateId, from, to) Promise
        +append(aggregateId, stream, expectedVersion)
        +loadAll(fromPosition) AsyncIterator
    }

    class InMemoryEventStore {
        -Object events
        -number globalPosition
        +load(aggregateId, from) Promise
        +loadFromTo(aggregateId, from, to) Promise
        +append(aggregateId, stream, expectedVersion)
        +loadAll(fromPosition) AsyncIterator
    }

    class EventBus {
        -ISubscriberRegistry subscribersRegistry
        -IListenersRegistry listenersRegistry
        +publish(message) Promise
        +attach(event, subscriber) EventBus
        +addListener(listener) EventBus
        -subscribersFor(eventType) EventSubscriber[]
    }

    class DeadLetterAwareEventBus {
        -IDeadLetterQueue deadLetterQueue
        -RetryPolicy retryPolicy
        +publish(message) Promise
        +attach(event, subscriber)
        +addListener(listener)
        -safeExecute(fn, message, handlerName) Promise
    }

    class IDeadLetterQueue {
        <<interface>>
        +enqueue(message) Promise
        +dequeue(limit) Promise
        +size() Promise
    }

    class DeadLetterMessage {
        +string id
        +DomainMessage originalMessage
        +string handlerName
        +Error error
        +number retryCount
        +Date failedAt
        +Date nextRetryAt
    }

    class RetryPolicy {
        -RetryPolicyConfig config
        +evaluate(currentRetryCount) RetryDecision
        +default()
        +noRetry()
    }

    class IdempotentEventBus {
        -IIdempotencyStore idempotencyStore
        -options
        +publish(message) Promise
    }

    class IIdempotencyStore {
        <<interface>>
        +exists(key) Promise
        +mark(key, ttl) Promise
        +remove(key) Promise
    }

    class InMemoryIdempotencyStore {
        -Map store
        +exists(key) Promise
        +mark(key, ttl) Promise
        +remove(key) Promise
    }

    class UpcasterChain {
        -Map upcasters
        +register(upcaster)
        +upcast(event) DomainEvent
        +getLatestVersion(eventType) number
        +hasUpcasters(eventType) bool
    }

    class EventUpcaster {
        <<interface>>
        +string eventType
        +number fromVersion
        +number toVersion
        +upcast(event)
    }

    class IEventListener {
        <<interface>>
        +on(message)
    }

    class EventListener {
        <<abstract>>
        +on(message) Promise
    }

    class EventSubscriber {
        <<abstract>>
        #Map handlers
        +on(message) Promise
        #registerHandler(eventType, handler)
    }

    class ISubscriberRegistry {
        <<interface>>
    }

    class IListenersRegistry {
        <<interface>>
    }

    class SnapshotStore {
        -ISnapshotStoreDBAL store
        +retrieve(aggregateRootId) Promise
        +snapshot(entity) Promise
    }

    class ISnapshotStoreDBAL {
        <<interface>>
        +get(uuid) Promise
        +store(entity) Promise
    }

    class InMemorySnapshotStoreDBAL {
        +snapshots
        +get(uuid) Promise
        +store(entity) Promise
    }

    class AggregateRootNotFoundException {
        <<Exception>>
    }

    class ConcurrencyException {
        <<Exception>>
        +string aggregateId
        +number expectedVersion
        +number actualVersion
    }

    class DomainMessage {
        +string eventType
        +uuid
        +string idempotencyKey
    }

    class DomainEventStream {
        +DomainMessage[] events
    }

    class EventSourcedAggregateRoot {
    }

    InMemoryEventStore ..|> IEventStoreDBAL : implements
    InMemorySnapshotStoreDBAL ..|> ISnapshotStoreDBAL : implements
    InMemoryIdempotencyStore ..|> IIdempotencyStore : implements
    EventListener ..|> IEventListener : implements
    EventSubscriber ..|> IEventListener : implements
    DeadLetterAwareEventBus --|> EventBus : extends
    IdempotentEventBus --|> EventBus : extends

    EventStore *-- IEventStoreDBAL : uses
    EventStore *-- EventBus : publishes to
    EventStore *-- SnapshotStore : optional
    EventStore *-- UpcasterChain : upcasts with
    SnapshotStore *-- ISnapshotStoreDBAL : uses
    EventBus *-- ISubscriberRegistry : manages
    EventBus *-- IListenersRegistry : manages
    DeadLetterAwareEventBus *-- IDeadLetterQueue : uses
    DeadLetterAwareEventBus *-- RetryPolicy : uses
    IdempotentEventBus *-- IIdempotencyStore : uses

    EventStore ..> DomainEventStream : loads/appends
    EventStore ..> EventSourcedAggregateRoot : manages
    EventStore ..> AggregateRootNotFoundException : throws
    EventStore ..> ConcurrencyException : throws
    EventBus ..> DomainMessage : publishes
    EventBus ..> EventSubscriber : notifies
    EventBus ..> EventListener : notifies
    SnapshotStore ..> EventSourcedAggregateRoot : snapshots
    InMemoryEventStore ..> DomainMessage : stores
    UpcasterChain ..> EventUpcaster : chains
```

## DDD Pattern Analysis

### Aggregate Root (Infrastructure Context)
- **EventStore<T>**: Primary aggregate coordinating event persistence and publication
  - Orchestrates DBAL, EventBus, and SnapshotStore
  - Implements event replay for projections
  - Manages snapshot strategy
  - **v6**: Integrates UpcasterChain for event version migration

### Entities
- **SnapshotStore<T>**: Entity managing snapshot lifecycle
- **EventBus**: Entity managing event distribution
- **UpcasterChain** (v6): Entity managing event version migrations

### Value Objects
- **ISubscriberRegistry**: Dictionary of event type to subscriber arrays
- **IListenersRegistry**: Dictionary of listener names to instances
- **ISnapshotDictionary**: Dictionary of aggregate IDs to snapshots
- **AggregateFactory<T>**: Constructor type for aggregate instantiation
- **DeadLetterMessage** (v6): Failed event envelope with retry metadata
- **RetryDecision** (v6): Result of retry policy evaluation
- **EventUpcaster<T>** (v6): Version transformation definition

### Interfaces (Ports)
- **IEventStoreDBAL**: Database abstraction for event persistence
  - **v6**: `append()` now accepts `expectedVersion` for optimistic locking
  - **v6**: `loadAll()` for streaming all events (projection rebuild)
- **ISnapshotStoreDBAL**: Database abstraction for snapshot persistence
- **IEventListener**: Base contract for event consumers
- **IIdempotencyStore** (v6): Duplicate detection storage
- **IDeadLetterQueue** (v6): Failed event storage

### Infrastructure Implementations (Adapters)
- **InMemoryEventStore**: In-memory DBAL for testing
  - **v6**: Implements version checking for optimistic locking
- **InMemorySnapshotStoreDBAL**: In-memory snapshot storage for testing
- **InMemoryIdempotencyStore** (v6): In-memory idempotency with TTL support
- **InMemoryDeadLetterQueue** (v6): In-memory dead letter queue

### Domain Services
- **EventListener**: Abstract base for listeners that receive all events
- **EventSubscriber**: Abstract base for subscribers with event-specific handlers
  - **v6**: Supports explicit handler registration via `registerHandler()`
- **DeadLetterAwareEventBus** (v6): EventBus with DLQ integration
- **IdempotentEventBus** (v6): EventBus with duplicate prevention
- **RetryPolicy** (v6): Exponential backoff configuration

### Exceptions
- **AggregateRootNotFoundException**: Thrown when aggregate not found
- **ConcurrencyException** (v6): Thrown on version conflicts

## Event Flow

```
1. CommandHandler calls Repository.save(aggregate)
2. Repository delegates to EventStore.save(aggregate)
3. EventStore:
   a. Gets uncommitted events from aggregate
   b. Appends to DBAL with expectedVersion for optimistic locking (v6)
   c. Takes snapshot if needed
   d. Publishes each event to EventBus
4. EventBus (or DeadLetterAwareEventBus/IdempotentEventBus):
   a. Finds subscribers for event type
   b. Notifies each subscriber (with retry/DLQ support in v6)
   c. Notifies all listeners
```

## Event Load Flow (with Upcasting)

```
1. Repository calls EventStore.load(aggregateId)
2. EventStore:
   a. Checks for snapshot
   b. Loads events from DBAL (from snapshot version or 0)
   c. Upcasts each event through UpcasterChain (v6)
   d. Reconstitutes aggregate from history
3. Returns hydrated aggregate
```

## Subscriber vs Listener Pattern

### EventSubscriber
- Receives specific events based on registration
- **v6 Preferred**: Explicit handler registration via `registerHandler()`
- **Legacy**: Method dispatch `on{EventType}(event)` still supported
- Used for projections and specific event handling

### EventListener
- Receives ALL events
- Single entry point: `on(message)`
- Used for logging, auditing, general event processing

## Dead Letter Queue Pattern (v6)

```
1. Event published to DeadLetterAwareEventBus
2. Handler throws exception
3. RetryPolicy evaluated:
   a. If retries remaining: wait with backoff, retry
   b. If max retries exceeded: send to DeadLetterQueue
4. DeadLetterQueue stores:
   - Original message
   - Handler name
   - Error details
   - Retry count
   - Failed timestamp
```

## Idempotency Pattern (v6)

```
1. Event published to IdempotentEventBus
2. Check idempotencyKey in store:
   a. If exists: skip (optionally call onDuplicate callback)
   b. If not exists: mark as processing
3. Process event through handlers
4. If error: remove key to allow retry
```

## Event Upcasting Pattern (v6)

```
1. Register upcasters for each version transition:
   - UserCreated v1 -> v2: add email field
   - UserCreated v2 -> v3: add timestamp field
2. On load, events are automatically migrated:
   - v1 event -> upcaster chain -> v3 event
3. Upcasters are applied in sequence based on fromVersion
```

## Snapshot Strategy

The EventStore takes snapshots based on:
1. Snapshot margin (default: 10 events)
2. Version divisibility: `version % margin === 0`
3. Non-zero version to avoid empty snapshots

## Design Decisions

1. **DBAL Pattern**: Database abstraction layer allows swapping storage implementations

2. **Fluent EventBus API**: `attach()` and `addListener()` return `this` for chaining

3. **Generic EventStore**: Typed with aggregate constructor for type-safe instantiation

4. **Optional Snapshotting**: SnapshotStore is optional, enabling simple use cases

5. **Async Event Publication**: Events are published sequentially to maintain ordering

6. **v6: Optimistic Locking**: `append()` accepts `expectedVersion` to detect concurrent modifications. `ConcurrencyException` thrown on conflicts.

7. **v6: Event Upcasting**: UpcasterChain integrates with EventStore.load() for transparent version migration. Events are upcasted before aggregate reconstitution.

8. **v6: Dead Letter Queue**: DeadLetterAwareEventBus provides resilient event handling with configurable retry policies and exponential backoff.

9. **v6: Idempotency at Bus Level**: IdempotentEventBus uses idempotencyKey from DomainMessage for bus-level duplicate prevention.

10. **v6: Explicit Handler Registration**: EventSubscriber supports `registerHandler()` for type-safe, explicit event routing. Legacy `on{EventType}` methods still work for backwards compatibility.

11. **v6: Streaming for Projections**: `IEventStoreDBAL.loadAll()` returns an async iterator for efficient projection rebuilds.

## Cross-Context References

- **EventStore** uses **Domain Layer** DomainEventStream and EventSourcedAggregateRoot
- **Repository** from **Domain Layer** depends on EventStore
- **Projector** from **Read Model Layer** extends EventSubscriber
- **ProjectionManager** from **Read Model Layer** uses `loadAll()` for rebuilds (v6)
- **Framework Layer** configures DBAL implementations via DI container
