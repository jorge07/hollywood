import type DomainEvent from "./Event/DomainEvent";

/**
 * Interface for event-sourced entities that can apply events recursively.
 *
 * Event-sourced entities maintain their state by applying a sequence of domain events.
 * This interface defines the contract for entities that support:
 * - Event application with recursive handling for child entities
 * - Snapshot restoration for performance optimization
 */
export default interface IEventSourced {
    /**
     * Restores the entity's state from a snapshot.
     *
     * @param snapshot - The snapshot data to restore from
     * @returns The entity instance for chaining
     */
    fromSnapshot(snapshot: IEventSourced): IEventSourced;

    /**
     * Applies an event to this entity and recursively to all child entities.
     *
     * @param event - The domain event to apply
     * @param eventType - Optional event type name (used when deserializing events)
     */
    recursiveHandling(event: DomainEvent, eventType?: string): void;
}
