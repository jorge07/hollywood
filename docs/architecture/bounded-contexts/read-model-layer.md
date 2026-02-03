# Read Model Layer - Query Projection Bounded Context

This document describes the Read Model Layer of the Hollywood-JS framework, which provides the infrastructure for building query-optimized read models through event projections.

## Overview

The Read Model Layer implements the "Query" side of CQRS by providing projectors that subscribe to domain events and maintain denormalized read models optimized for query performance.

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
            +Promise~void~ on(DomainMessage message)
        }

        class DomainMessage {
            +string eventType
            +object|DomainEvent event
            +AggregateRootId uuid
            +Date occurred
            +number playhead
        }

        class EventBus {
            +EventBus attach(any event, EventSubscriber subscriber)
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

        class IAppResponse {
            <<interface>>
            +any data
            +any[] meta
        }
    }

    %% Inheritance
    Projector --|> EventSubscriber : extends

    %% Composition
    Projector *-- InMemoryReadModelRepository : uses

    %% Dependencies
    Projector ..> DomainMessage : receives
    EventBus ..> Projector : notifies
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
- **Projector**: Abstract base for event-driven read model updaters
  - Inherits EventSubscriber's dynamic method dispatch
  - Methods follow `on{EventType}(event)` naming convention

### Value Objects
- **ReadModelDTO**: Denormalized data structure optimized for queries
- **InMemoryReadModelRepository.collection**: Dictionary of read model instances

### Repository (Infrastructure)
- **InMemoryReadModelRepository**: Simple in-memory storage for read models
  - `save(id, data)`: Upsert operation
  - `oneOrFail(id)`: Fetch with not-found exception
  - `find(criteria)`: Flexible querying with callback filter

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
Dynamic dispatch to on{EventType}(event)
         |
         v
Update ReadModel in Repository
```

## Example Projector Implementation

```typescript
import { EventSubscriber } from 'hollywood-js';
import type { Projector } from 'hollywood-js';

// Projector is a type alias for EventSubscriber - extend EventSubscriber directly
class UserProjector extends EventSubscriber {
    constructor(private readonly repository: InMemoryReadModelRepository) {
        super();
    }

    // Called when UserCreated event is published
    public onUserCreated(event: UserCreated): void {
        this.repository.save(event.userId, {
            id: event.userId,
            email: event.email,
            name: event.name,
            createdAt: new Date()
        });
    }

    // Called when UserEmailChanged event is published
    public onUserEmailChanged(event: UserEmailChanged): void {
        const user = this.repository.oneOrFail(event.userId);
        user.email = event.newEmail;
        this.repository.save(event.userId, user);
    }
}

// The Projector type alias can be used for semantic clarity in type declarations
const projector: Projector = new UserProjector(repository);
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

2. **Convention-Based Dispatch**: Event routing via method names (`on{EventType}`) enables clean, focused handler methods

3. **Simple Repository Interface**: InMemoryReadModelRepository provides essential CRUD without complexity

4. **Flexible Criteria Queries**: The `find(criteria)` method accepts a callback for arbitrary filtering

5. **Eventual Consistency**: Read models are updated asynchronously after events are published

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
