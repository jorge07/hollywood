/**
 * Domain events represent immutable facts that have occurred in the domain.
 * They are named in past tense (e.g., UserCreated, OrderShipped).
 *
 * Required fields:
 * - aggregateId: The ID of the aggregate that raised this event
 * - occurredAt: When the event occurred (for ordering and audit trails)
 *
 * Optional fields:
 * - correlationId: Links events across distributed operations
 * - causationId: The ID of the command or event that caused this event
 * - version: Event schema version for upcasting support
 *
 * This is an interface rather than an abstract class because:
 * 1. Event type extraction uses constructor.name directly (see DomainMessage.extractEventType)
 * 2. Events should be plain data objects without inherited behavior
 * 3. Allows events to extend other classes if needed
 *
 * @example
 * ```typescript
 * // Simple event
 * class UserCreated implements DomainEvent {
 *     constructor(
 *         public readonly aggregateId: string,
 *         public readonly userId: string,
 *         public readonly email: string,
 *         public readonly occurredAt: Date = new Date()
 *     ) {}
 * }
 *
 * // Event with correlation tracking
 * class OrderPlaced implements DomainEvent {
 *     constructor(
 *         public readonly aggregateId: string,
 *         public readonly orderId: string,
 *         public readonly occurredAt: Date = new Date(),
 *         public readonly correlationId?: string,
 *         public readonly causationId?: string
 *     ) {}
 * }
 *
 * // Versioned event for upcasting support
 * class UserCreatedV2 implements DomainEvent {
 *     readonly version = 2;
 *     constructor(
 *         public readonly aggregateId: string,
 *         public readonly userId: string,
 *         public readonly email: string,
 *         public readonly occurredAt: Date = new Date(),
 *         public readonly correlationId?: string
 *     ) {}
 * }
 * ```
 */
export default interface DomainEvent {
    /**
     * The ID of the aggregate that raised this event.
     * This links the event to its source aggregate.
     */
    readonly aggregateId: string;

    /**
     * When this event occurred.
     * Used for event ordering, temporal queries, and audit trails.
     */
    readonly occurredAt: Date;

    /**
     * Optional correlation ID for distributed tracing.
     * Links events across bounded contexts and services.
     */
    readonly correlationId?: string;

    /**
     * Optional causation ID.
     * The ID of the command or event that caused this event.
     */
    readonly causationId?: string;

    /**
     * Optional event schema version for upcasting support.
     * Use when you need to evolve event schemas over time.
     */
    readonly version?: number;
}
