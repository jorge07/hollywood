/**
 * Marker interface for domain events.
 *
 * Domain events represent facts that have occurred in the domain.
 * They are immutable and named in past tense (e.g., UserCreated, OrderShipped).
 *
 * This is a marker interface rather than an abstract class because:
 * 1. Event type extraction uses constructor.name directly (see DomainMessage.extractEventType)
 * 2. Events should be plain data objects without inherited behavior
 * 3. Allows events to extend other classes if needed
 *
 * For event versioning and upcasting support, add an optional `version` property:
 *
 * @example
 * ```typescript
 * class UserCreated implements DomainEvent {
 *     readonly version = 1;
 *     constructor(
 *         public readonly userId: string,
 *         public readonly email: string
 *     ) {}
 * }
 * ```
 */
export default interface DomainEvent {
    // Marker interface - implementations should be immutable data classes
    // For upcasting support, add: readonly version?: number;
}
