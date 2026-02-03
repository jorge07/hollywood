import type IEventSourced from "./IEventSourced";
import type DomainEvent from "./Event/DomainEvent";

export default abstract class EventSourced implements IEventSourced {
    protected eventHandlers = new Map<string, (event: DomainEvent) => void>();
    private children: EventSourced[] = [];
    /**
     * Restores entity state from a snapshot.
     *
     * Uses a safe rehydration pattern instead of Object.assign to:
     * - Preserve class prototypes and methods
     * - Avoid overwriting critical infrastructure (event handlers)
     * - Only copy data properties, not methods
     *
     * @param snapshot - Snapshot data to restore from
     * @returns This entity with restored state
     */
    public fromSnapshot(snapshot: EventSourced): EventSourced {
        // Preserve infrastructure that shouldn't be in snapshots
        const handlers = this.eventHandlers;

        // Copy only data properties (not methods or special properties)
        // This preserves the prototype chain and class methods
        for (const key in snapshot) {
            if (snapshot.hasOwnProperty(key) && key !== 'eventHandlers' && key !== 'children') {
                // Only copy if it's a data property (not a method)
                const descriptor = Object.getOwnPropertyDescriptor(snapshot, key);
                if (descriptor && typeof descriptor.value !== 'function') {
                    (this as any)[key] = (snapshot as any)[key];
                }
            }
        }

        // Restore infrastructure
        this.eventHandlers = handlers;

        return this;
    }

    public recursiveHandling(event: DomainEvent, eventType?: string): void {
        this.handle(event, eventType);

        this.getChildEntities().forEach((aggregate: EventSourced) => {
            aggregate.recursiveHandling(event, eventType);
        });
    }

    protected getChildEntities(): EventSourced[] {
        return this.children;
    }

    protected registerChildren(child: EventSourced): void {
        this.children.push(child)
    }

    /**
     * Register an explicit event handler for a specific event type.
     * All events raised by the aggregate must have a registered handler.
     */
    protected registerHandler<T extends DomainEvent>(
        eventType: new (...args: any[]) => T,
        handler: (event: T) => void
    ): void {
        this.eventHandlers.set(eventType.name, handler as (event: DomainEvent) => void);
    }

    private handle(event: DomainEvent, eventType?: string): void {
        // Use provided eventType (from DomainMessage) or fall back to constructor.name
        // This handles deserialized events that lose their prototype
        const eventName = eventType || event.constructor.name;
        const handler = this.eventHandlers.get(eventName);

        if (!handler) {
            throw new Error(`No handler registered for ${eventName}`);
        }

        handler(event);
    }

}
