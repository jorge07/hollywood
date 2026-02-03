# Read Model Layer - Query Projection Bounded Context

This document describes the Read Model Layer of the Hollywood-JS framework, which provides the infrastructure for building query-optimized read models through event projections.

**Version**: 6.0.0-beta

## Overview

The Read Model Layer implements the "Query" side of CQRS by providing projectors that subscribe to domain events and maintain denormalized read models optimized for query performance.

### v6-beta Changes
- **ProjectionManager**: Orchestrates projection rebuilds and catch-up
- **ProjectionPositionStore**: Tracks projection progress for resumable rebuilds
- **Projector is type alias**: Clarified that Projector is a type alias for EventSubscriber

## UML Class Diagram

```mermaid
classDiagram
    namespace ReadModelLayer {
        %% Projector (Type Alias for EventSubscriber)
        class Projector {
            <<type alias>>
            %% Type alias for EventSubscriber used in read model context
            +Promise~void~ on(DomainMessage message)
        }

        %% Projection Manager (v6)
        class ProjectionManager {
            -IEventStoreDBAL eventStore
            -IProjectionPositionStore positionStore
            +Promise~void~ rebuild(Projector projector)
            +Promise~void~ catchUp(Projector projector)
            +Promise~number~ getPosition(string projectorName)
            -Promise~void~ processEventsFrom(Projector projector, number fromPosition)
            -string getProjectorName(Projector projector)
        }

        %% Projection Position Store (v6)
        class IProjectionPositionStore {
            <<interface>>
            +Promise~ProjectionPosition|null~ get(string projectionName)
            +Promise~void~ save(ProjectionPosition position)
            +Promise~void~ reset(string projectionName)
        }

        class InMemoryProjectionPositionStore {
            -Map~string,ProjectionPosition~ positions
            +Promise~ProjectionPosition|null~ get(string projectionName)
            +Promise~void~ save(ProjectionPosition position)
            +Promise~void~ reset(string projectionName)
        }

        class ProjectionPosition {
            <<interface>>
            +string projectionName
            +number lastProcessedPosition
            +Date lastProcessedAt
        }

        %% Read Model Repository
        class InMemoryReadModelRepository {
            -Object collection
            +void save(string id, any data)
            +any oneOrFail(string id)
            +any find(Function criteria)
        }

        %% Read Model Data Structure
        class ReadModel {
            <<interface>>
            +string id
            +any data
        }
    }

    namespace EventSourcingLayer {
        class EventSubscriber {
            <<abstract>>
            #Map~string,Function~ handlers
            +Promise~void~ on(DomainMessage message)
            #void registerHandler~T~(eventType, handler)
        }

        class DomainMessage {
            +string eventType
            +object|DomainEvent event
            +AggregateRootId uuid
            +Date occurred
            +number playhead
            +string idempotencyKey
        }

        class EventBus {
            +EventBus attach(any event, EventSubscriber subscriber)
        }

        class IEventStoreDBAL {
            <<interface>>
            +AsyncIterator~DomainMessage~ loadAll(number fromPosition)
        }
    }

    namespace ApplicationLayer {
        class IQuery {
            <<interface>>
        }

        class IQueryHandler {
            <<interface>>
            +Promise~IAppResponse|IAppError~ handle(IQuery request)
        }

        class IAppResponse~TData,TMeta~ {
            <<interface>>
            +TData data
            +TMeta[] meta
        }
    }

    %% Inheritance
    Projector --|> EventSubscriber : type alias for
    InMemoryProjectionPositionStore ..|> IProjectionPositionStore : implements

    %% Composition
    Projector *-- InMemoryReadModelRepository : uses
    ProjectionManager *-- IEventStoreDBAL : reads from
    ProjectionManager *-- IProjectionPositionStore : tracks with

    %% Dependencies
    Projector ..> DomainMessage : receives
    EventBus ..> Projector : notifies
    ProjectionManager ..> Projector : rebuilds
    InMemoryReadModelRepository ..> ReadModel : stores
    IQueryHandler ..> InMemoryReadModelRepository : queries
    IQueryHandler ..> IAppResponse : returns
```

## Extended Architecture Diagram

```mermaid
classDiagram
    namespace ReadModelLayerComplete {
        %% Projector Type Alias
        class Projector {
            <<type alias>>
            %% Type alias for EventSubscriber
        }

        %% Concrete Projector Example Pattern (extends EventSubscriber)
        class ConcreteProjector {
            <<example>>
            -ReadModelRepository repository
            +Promise~void~ on(DomainMessage message)
            +void onUserCreated(UserCreated event)
            +void onUserEmailChanged(UserEmailChanged event)
            +void onUserDeleted(UserDeleted event)
        }

        %% Read Model Repository Interface
        class IReadModelRepository~T~ {
            <<interface>>
            +void save(string id, T data)
            +T oneOrFail(string id)
            +T[] find(Function criteria)
            +void delete(string id)
        }

        %% In-Memory Implementation
        class InMemoryReadModelRepository {
            -Object collection
            +void save(string id, any data)
            +any oneOrFail(string id)
            +any find(Function criteria)
        }

        %% Read Model DTO
        class ReadModelDTO {
            <<ValueObject>>
            +string id
            +any data
            +Date updatedAt
        }

        %% Query Handler Pattern
        class ReadModelQueryHandler {
            <<example>>
            -IReadModelRepository repository
            +Promise~IAppResponse~ handle(GetUserQuery query)
        }

        class GetUserQuery {
            <<example>>
            +string userId
        }

        class UserReadModel {
            <<example>>
            +string id
            +string email
            +string name
            +Date createdAt
        }
    }

    namespace EventSourcingLayerRef {
        class EventSubscriber {
            <<abstract>>
        }
        class DomainMessage
    }

    %% Inheritance
    Projector --|> EventSubscriber : extends
    ConcreteProjector --|> Projector : extends
    InMemoryReadModelRepository ..|> IReadModelRepository : implements

    %% Composition
    ConcreteProjector *-- IReadModelRepository : uses

    %% Dependencies
    Projector ..> DomainMessage : receives
    ConcreteProjector ..> UserReadModel : projects to
    ReadModelQueryHandler ..> IReadModelRepository : queries
    ReadModelQueryHandler ..> GetUserQuery : handles
```

## DDD Pattern Analysis

### Aggregate Root
The Read Model Layer does not define traditional aggregate roots. Instead, projectors act as event handlers that maintain denormalized views.

### Entities
- **Projector** (type alias): EventSubscriber used for read model updates
  - **v6**: Supports explicit handler registration via `registerHandler()`
  - **Legacy**: Methods follow `on{EventType}(event)` naming convention
- **ProjectionManager** (v6): Orchestrates projection rebuilds and catch-up

### Value Objects
- **ReadModelDTO**: Denormalized data structure optimized for queries
- **InMemoryReadModelRepository.collection**: Dictionary of read model instances
- **ProjectionPosition** (v6): Tracks projector progress (name, position, timestamp)

### Repository (Infrastructure)
- **InMemoryReadModelRepository**: Simple in-memory storage for read models
  - `save(id, data)`: Upsert operation
  - `oneOrFail(id)`: Fetch with not-found exception
  - `find(criteria)`: Flexible querying with callback filter

### Interfaces (Ports) - v6
- **IProjectionPositionStore**: Contract for projection position persistence
  - `get(projectionName)`: Retrieve last processed position
  - `save(position)`: Update position
  - `reset(projectionName)`: Reset for full rebuild

## Projection Pattern

```
DomainEvent published to EventBus
         |
         v
EventBus.publish(message)
         |
         v
Projector.on(message)
         |
         v
Handler dispatch (explicit or legacy)
         |
         v
Update ReadModel in Repository
```

## Projection Rebuild Pattern (v6)

```
ProjectionManager.rebuild(projector)
         |
         v
Reset projection position to 0
         |
         v
Stream all events via IEventStoreDBAL.loadAll()
         |
         v
For each event:
  - projector.on(message)
  - Update position in store
         |
         v
Projection fully rebuilt
```

## Projection Catch-Up Pattern (v6)

```
ProjectionManager.catchUp(projector)
         |
         v
Get last processed position from store
         |
         v
Stream events from that position
         |
         v
Process only new events
```

## Example Projector Implementation

```typescript
import { EventSubscriber } from 'hollywood-js';
import type { Projector } from 'hollywood-js';

// v6 Preferred: Explicit handler registration
class UserProjector extends EventSubscriber {
    constructor(private readonly repository: InMemoryReadModelRepository) {
        super();
        this.registerHandler(UserCreated, this.onUserCreated.bind(this));
        this.registerHandler(UserEmailChanged, this.onUserEmailChanged.bind(this));
    }

    private onUserCreated(event: UserCreated): void {
        this.repository.save(event.userId, {
            id: event.userId,
            email: event.email,
            name: event.name,
            createdAt: new Date()
        });
    }

    private onUserEmailChanged(event: UserEmailChanged): void {
        const user = this.repository.oneOrFail(event.userId);
        user.email = event.newEmail;
        this.repository.save(event.userId, user);
    }
}

// The Projector type alias can be used for semantic clarity in type declarations
const projector: Projector = new UserProjector(repository);
```

## Projection Rebuild Example (v6)

```typescript
import { ProjectionManager, InMemoryProjectionPositionStore } from 'hollywood-js';

// Create projection manager
const projectionManager = new ProjectionManager(
    eventStoreDBAL,
    new InMemoryProjectionPositionStore()
);

// Full rebuild (resets position to 0, processes all events)
await projectionManager.rebuild(userProjector);

// Catch-up (resumes from last position)
await projectionManager.catchUp(userProjector);

// Check current position
const position = await projectionManager.getPosition('UserProjector');
console.log(`Processed up to position ${position}`);
```

## Query Handler Integration

```typescript
class GetUserHandler implements IQueryHandler {
    constructor(private readonly repository: InMemoryReadModelRepository) {}

    @autowiring
    public async handle(query: GetUserQuery): Promise<IAppResponse> {
        const user = this.repository.oneOrFail(query.userId);
        return { data: user, meta: [] };
    }
}
```

## Design Decisions

1. **Projector as Type Alias**: Projector is a type alias for EventSubscriber rather than an empty subclass, providing semantic clarity without empty abstraction overhead. To create a projector, extend EventSubscriber directly and use the Projector type alias for documentation/typing purposes.

2. **v6: Explicit Handler Registration**: Preferred approach using `registerHandler()` for type-safe, explicit event routing. Legacy `on{EventType}` methods still work for backwards compatibility.

3. **Simple Repository Interface**: InMemoryReadModelRepository provides essential CRUD without complexity

4. **Flexible Criteria Queries**: The `find(criteria)` method accepts a callback for arbitrary filtering

5. **Eventual Consistency**: Read models are updated asynchronously after events are published

6. **v6: ProjectionManager**: Centralized projection rebuild and catch-up orchestration:
   - Full rebuild from position 0
   - Incremental catch-up from last position
   - Position tracking for resumable operations

7. **v6: Streaming for Rebuilds**: Uses async iterators via `IEventStoreDBAL.loadAll()` for memory-efficient event streaming during rebuilds

8. **v6: Position Tracking**: ProjectionPositionStore tracks per-projector progress, enabling:
   - Resumable rebuilds after failures
   - Incremental catch-up for late-starting projectors
   - Monitoring of projection lag

## Query vs Command Model Separation

| Aspect | Command Model | Query Model |
|--------|---------------|-------------|
| Optimized for | Write operations | Read operations |
| Structure | Normalized, aggregate-based | Denormalized, query-specific |
| Consistency | Strong (within aggregate) | Eventual |
| Update mechanism | Direct state mutation | Event projection |
| Storage | EventStore | ReadModelRepository |

## Cross-Context References

- **Projector** is a type alias for **Event Sourcing Layer** EventSubscriber
- **Projector** receives **Domain Layer** DomainMessage/DomainEvent
- Query handlers use **Application Layer** QueryBus
- **Framework Layer** registers projectors with EventBus via ListenerType
