import DomainEvent from "../../Domain/Event/DomainEvent";

/**
 * Interface for event upcasters that transform events from one version to another.
 *
 * Upcasters are used during event sourcing to migrate events from older schema versions
 * to newer ones, allowing the system to evolve while maintaining backwards compatibility
 * with historical events.
 *
 * @template T - The type of DomainEvent this upcaster handles
 */
export interface EventUpcaster<T extends DomainEvent = DomainEvent> {
    /**
     * The name of the event type this upcaster handles.
     * This should match the event's domainEventName() or constructor name.
     */
    readonly eventType: string;

    /**
     * The version this upcaster transforms from.
     */
    readonly fromVersion: number;

    /**
     * The version this upcaster transforms to.
     */
    readonly toVersion: number;

    /**
     * Transforms an event from the old version to the new version.
     *
     * @param event - The event to upcast
     * @returns The upcasted event with the new schema
     */
    upcast(event: T): T;
}

export default EventUpcaster;
