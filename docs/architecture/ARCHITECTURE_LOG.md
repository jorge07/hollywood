# Architecture Decision Log

This document tracks architectural decisions and changes to the Hollywood-JS framework documentation.

## Log Format

Each entry follows this format:
```
## [DATE] - TITLE

### Context
Why the decision was needed

### Decision
What was decided

### Consequences
Impact and trade-offs
```

---

## [2026-02-03] - v6-beta Architecture Update

### Context
Major v6-beta upgrade introduces significant new features addressing previously identified gaps:
- Event versioning and schema evolution
- Long-running process orchestration (Sagas)
- Resilient event handling (Dead Letter Queue)
- Duplicate prevention (Idempotency)
- Concurrency control (Optimistic Locking)
- Projection maintenance (Rebuild capability)

Additionally, several anti-patterns from v5 have been fixed:
- DomainEvent changed from abstract class to interface
- Explicit handler registration replaces reflection-based method lookup
- Projector is now a type alias, not an empty subclass

### Decision
Updated all architecture documentation to reflect v6-beta changes:

#### 1. Event Versioning and Upcasting
- Added `UpcasterChain` to Event Sourcing Layer
- Added `EventUpcaster<T>` interface
- Integrated upcasting into `EventStore.load()` flow
- Events can now have optional `version` field (defaults to 1)

#### 2. Saga/Process Manager Support
- Added `Saga<TState>` abstract class to Application Layer
- Added `SagaManager` extending `EventListener` for event routing
- Added `ISagaRepository` interface and `InMemorySagaRepository`
- Added `SagaStatus` enum and `SagaStateSnapshot<TState>` interface
- Documented compensation pattern for failure handling

#### 3. Dead Letter Queue
- Added `DeadLetterAwareEventBus` extending `EventBus`
- Added `IDeadLetterQueue` interface and `InMemoryDeadLetterQueue`
- Added `RetryPolicy` with exponential backoff support
- Added `DeadLetterMessage` value object

#### 4. Idempotency Keys
- Added `idempotencyKey` to `DomainMessage`
- Added `IdempotentEventBus` extending `EventBus`
- Added `IIdempotencyStore` interface and `InMemoryIdempotencyStore`
- Idempotency can be applied at bus level or per-handler

#### 5. Optimistic Locking
- Added `ConcurrencyException` to Event Sourcing Layer
- Updated `IEventStoreDBAL.append()` to accept `expectedVersion`
- Added `Repository.saveWithRetry()` for automatic conflict resolution
- `InMemoryEventStore` implements version checking

#### 6. Projection Rebuild
- Added `ProjectionManager` to Read Model Layer
- Added `IProjectionPositionStore` and `InMemoryProjectionPositionStore`
- Added `ProjectionPosition` value object
- Added `IEventStoreDBAL.loadAll()` for streaming all events
- Supports full rebuild and incremental catch-up

#### 7. Anti-Pattern Fixes
- **DomainEvent**: Changed from abstract class to interface
  - Allows events to be plain data objects
  - No forced inheritance
  - Better TypeScript compatibility

- **Explicit Handler Registration**:
  - `EventSourcedAggregateRoot.registerHandler()` for aggregates
  - `EventSubscriber.registerHandler()` for projectors/subscribers
  - Type-safe, explicit, refactoring-friendly
  - Legacy `apply*`/`on*` methods still work for backwards compatibility
  - Strict mode when handlers registered (throws on missing handler)

- **Projector Type Alias**:
  - Projector is now `type Projector = EventSubscriber`
  - Avoids empty abstract class anti-pattern
  - Semantic clarity without inheritance overhead

#### 8. Type Safety Improvements
- **Generic Middleware**: `IMiddleware<TMessage, TResponse>`
  - Type-safe message and response types
  - `NextMiddleware<TMessage, TResponse>` function type
  - `Message = ICommand | IQuery` union type

- **Generic Responses**: `IAppResponse<TData, TMeta>`
  - Typed data and metadata arrays
  - `QueryBusResponse<TData, TMeta>` union type

#### 9. Dependency Upgrades
- TypeScript 5.9
- Jest 30
- ESLint 9 (replaced TSLint)
- Node.js 20/22 LTS support

### Consequences

**Positive:**
- Comprehensive event schema evolution support
- Production-ready resilience patterns (DLQ, idempotency)
- Long-running process support (Sagas)
- Safe concurrent modifications (optimistic locking)
- Maintainable projections (rebuild capability)
- Improved type safety throughout
- Cleaner patterns (explicit registration, interface-based events)

**Negative:**
- Learning curve for new patterns
- Migration effort for existing code using legacy patterns
- Documentation maintenance burden increased

**Migration Notes:**
- Existing code using `apply*` methods continues to work
- Existing code using `on*` subscriber methods continues to work
- DomainEvent implementations may need `implements DomainEvent` added
- New features are opt-in and additive

---

## [2026-02-03] - Initial Architecture Documentation

### Context
The Hollywood-JS framework (v5.0.4) lacked comprehensive UML documentation following DDD principles. The codebase implements CQRS, Event Sourcing, and DDD patterns but required formal documentation for:
- Onboarding new developers
- Architectural review
- Identifying bounded context boundaries
- Understanding cross-layer dependencies

### Decision
Created comprehensive Mermaid-based UML class diagrams organized by bounded context:

1. **Application Layer** (`bounded-contexts/application-layer.md`)
   - Documents CQRS pattern implementation
   - Shows CommandBus, QueryBus, and middleware chain
   - Identifies App as the aggregate root

2. **Domain Layer** (`bounded-contexts/domain-layer.md`)
   - Documents Event Sourcing primitives
   - Shows aggregate root hierarchy
   - Identifies EventSourcedAggregateRoot as primary aggregate root

3. **Event Sourcing Layer** (`bounded-contexts/event-sourcing-layer.md`)
   - Documents persistence infrastructure
   - Shows EventStore, EventBus, SnapshotStore
   - Identifies EventStore as infrastructure aggregate root

4. **Framework Layer** (`bounded-contexts/framework-layer.md`)
   - Documents DI and bootstrapping
   - Shows Kernel, ModuleContext, service types
   - Identifies Kernel as composition root

5. **Read Model Layer** (`bounded-contexts/read-model-layer.md`)
   - Documents projection pattern
   - Shows Projector extending EventSubscriber
   - Explains eventual consistency model

### Consequences

**Positive:**
- Clear visualization of framework architecture
- DDD patterns explicitly identified
- Cross-context dependencies documented
- Onboarding time reduced

**Negative:**
- Documentation must be maintained alongside code changes
- Mermaid syntax limitations in some complex diagrams

**Recommendations:**
- Set up pre-commit hooks to validate architecture changes
- Review documentation quarterly for accuracy

---

## Architectural Observations

### Identified DDD Patterns

| Pattern | Implementation |
|---------|---------------|
| Aggregate Root | EventSourcedAggregateRoot, App, Kernel, EventStore |
| Entity | EventSourced, ModuleContext, Saga<TState> (v6) |
| Value Object | DomainEvent (interface), DomainMessage, ICommand, IQuery, SagaStateSnapshot (v6) |
| Repository | Repository<T>, IRepository<T>, ISagaRepository (v6) |
| Domain Service | CommandBus, QueryBus, EventBus, SagaManager (v6), ProjectionManager (v6) |
| Factory | AppBuilder, HollywoodModule, BuildFromModuleContext, SagaFactory (v6) |
| Domain Event | DomainEvent interface (v6: changed from abstract class) |

### Cross-Cutting Concerns

1. **Middleware Pattern**: Both buses support generic middleware for:
   - Logging
   - Validation
   - Transactions
   - Error handling

2. **DBAL Pattern**: Database abstraction allows:
   - Testing with InMemory implementations
   - Production with real databases
   - No framework code changes needed

3. **Idempotency** (v6): Duplicate prevention at:
   - Bus level (IdempotentEventBus)
   - Handler level (IdempotentHandler)
   - Saga level (processedEvents tracking)

4. **Resilience** (v6): Failure handling via:
   - Dead Letter Queue
   - Retry Policy with exponential backoff
   - Compensation handlers in Sagas

### Previously Identified Gaps - Now Addressed in v6

| Gap | v6 Solution |
|-----|-------------|
| Saga/Process Manager | `Saga<TState>`, `SagaManager`, `ISagaRepository` |
| Event Upcasting | `UpcasterChain`, `EventUpcaster<T>` |
| Concurrency Control | `ConcurrencyException`, `expectedVersion` in append |
| Event Versioning | Optional `version` field on DomainEvent, upcasting support |
| Projection Rebuild | `ProjectionManager`, `ProjectionPositionStore` |
| Dead Letter Queue | `DeadLetterAwareEventBus`, `RetryPolicy` |
| Idempotency | `IdempotentEventBus`, `IIdempotencyStore` |

### Areas for Future Consideration

1. **Event Schema Registry**: Centralized schema management and validation

2. **Distributed Sagas**: Multi-service saga coordination

3. **Event Archival**: Long-term event storage strategies

4. **Projection Versioning**: Schema evolution for read models

5. **Aggregate Caching**: In-memory aggregate cache for hot aggregates

---

## Change History

| Date | Author | Change |
|------|--------|--------|
| 2026-02-03 | Claude Opus 4.5 | v6-beta architecture update |
| 2026-02-03 | Claude | Initial documentation creation |

---

## Review Schedule

- **Quarterly**: Review diagrams against codebase
- **On Major Release**: Update all bounded context documentation
- **On Breaking Change**: Log decision and update affected diagrams
- **On v6 GA**: Final review and migration guide completion
