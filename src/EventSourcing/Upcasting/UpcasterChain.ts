import DomainEvent from "../../Domain/Event/DomainEvent";
import type { EventUpcaster } from "./EventUpcaster";

/**
 * Manages a chain of event upcasters for migrating events through multiple versions.
 *
 * The UpcasterChain allows registering multiple upcasters for each event type and
 * automatically applies them in sequence to migrate events from any version to
 * the latest version.
 *
 * @example
 * ```typescript
 * const chain = new UpcasterChain();
 *
 * // Register upcasters for UserCreatedEvent
 * chain.register({
 *   eventType: 'UserCreatedEvent',
 *   fromVersion: 1,
 *   toVersion: 2,
 *   upcast: (event) => ({ ...event, email: event.email || '', version: 2 })
 * });
 *
 * chain.register({
 *   eventType: 'UserCreatedEvent',
 *   fromVersion: 2,
 *   toVersion: 3,
 *   upcast: (event) => ({ ...event, createdAt: event.createdAt || new Date(), version: 3 })
 * });
 *
 * // Upcast a v1 event to v3
 * const upcastedEvent = chain.upcast(oldEvent);
 * ```
 */
export class UpcasterChain {
    private upcasters: Map<string, EventUpcaster<any>[]> = new Map();

    /**
     * Registers an upcaster for a specific event type and version transition.
     *
     * @param upcaster - The upcaster to register
     * @throws Error if an upcaster for the same event type and fromVersion already exists
     */
    register<T extends DomainEvent>(upcaster: EventUpcaster<T>): void {
        const eventType = upcaster.eventType;

        if (!this.upcasters.has(eventType)) {
            this.upcasters.set(eventType, []);
        }

        const existingUpcasters = this.upcasters.get(eventType)!;

        // Check for duplicate fromVersion
        const duplicate = existingUpcasters.find(
            (existing) => existing.fromVersion === upcaster.fromVersion
        );

        if (duplicate) {
            throw new Error(
                `Upcaster for event type '${eventType}' from version ${upcaster.fromVersion} already registered`
            );
        }

        existingUpcasters.push(upcaster);

        // Sort by fromVersion to ensure proper chain order
        existingUpcasters.sort((a, b) => a.fromVersion - b.fromVersion);
    }

    /**
     * Upcasts an event through all applicable version migrations.
     *
     * If no upcasters are registered for the event type, or if the event
     * is already at the latest version, the original event is returned unchanged.
     *
     * @param event - The event to upcast
     * @returns The upcasted event at the latest version
     */
    upcast(event: DomainEvent): DomainEvent {
        const eventType = event.constructor.name;
        const upcasters = this.upcasters.get(eventType);

        if (!upcasters || upcasters.length === 0) {
            return event;
        }

        let currentEvent = event;
        // Events without version property are treated as version 1
        let currentVersion = (event as { version?: number }).version ?? 1;

        // Apply upcasters in sequence
        for (const upcaster of upcasters) {
            if (upcaster.fromVersion === currentVersion) {
                currentEvent = upcaster.upcast(currentEvent);
                currentVersion = upcaster.toVersion;
            }
        }

        return currentEvent;
    }

    /**
     * Checks if any upcasters are registered for a given event type.
     *
     * @param eventType - The event type name to check
     * @returns true if upcasters exist for this event type
     */
    hasUpcastersFor(eventType: string): boolean {
        const upcasters = this.upcasters.get(eventType);
        return upcasters !== undefined && upcasters.length > 0;
    }

    /**
     * Gets the number of registered upcasters for a given event type.
     *
     * @param eventType - The event type name to check
     * @returns The number of registered upcasters
     */
    getUpcasterCount(eventType: string): number {
        const upcasters = this.upcasters.get(eventType);
        return upcasters ? upcasters.length : 0;
    }
}

export default UpcasterChain;
