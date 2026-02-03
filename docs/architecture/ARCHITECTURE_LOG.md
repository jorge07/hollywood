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
| Entity | EventSourced, ModuleContext |
| Value Object | DomainEvent, DomainMessage, ICommand, IQuery |
| Repository | Repository<T>, IRepository<T> |
| Domain Service | CommandBus, QueryBus, EventBus |
| Factory | AppBuilder, HollywoodModule, BuildFromModuleContext |
| Domain Event | DomainEvent abstract class |

### Cross-Cutting Concerns

1. **Middleware Pattern**: Both buses support middleware for:
   - Logging
   - Validation
   - Transactions
   - Error handling

2. **DBAL Pattern**: Database abstraction allows:
   - Testing with InMemory implementations
   - Production with real databases
   - No framework code changes needed

### Areas for Future Consideration

1. **Saga/Process Manager**: Not currently implemented; would enhance long-running process support

2. **Event Upcasting**: No explicit upcasting mechanism for event schema evolution

3. **Concurrency Control**: Playhead provides optimistic locking foundation but no explicit conflict resolution

4. **Event Versioning**: No built-in event versioning strategy

---

## Change History

| Date | Author | Change |
|------|--------|--------|
| 2026-02-03 | Claude | Initial documentation creation |

---

## Review Schedule

- **Quarterly**: Review diagrams against codebase
- **On Major Release**: Update all bounded context documentation
- **On Breaking Change**: Log decision and update affected diagrams
