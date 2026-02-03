import type IEventSourced from "./IEventSourced";
import type DomainEvent from "./Event/DomainEvent";

export default abstract class EventSourced implements IEventSourced {
    protected readonly eventHandlers = new Map<string, (event: DomainEvent) => void>();
    private children: EventSourced[] = [];
    public fromSnapshot(snapshot: EventSourced): EventSourced {
        Object.assign(this, snapshot);
        return this;
    }

    public recursiveHandling(event: object|DomainEvent, method: string): void {
        this.handle(event, method);

        this.getChildEntities().forEach((aggregate: EventSourced) => {
            aggregate.recursiveHandling(event, method);
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
     * This is the preferred approach over the legacy apply* method pattern.
     */
    protected registerHandler<T extends DomainEvent>(
        eventType: new (...args: any[]) => T,
        handler: (event: T) => void
    ): void {
        this.eventHandlers.set(eventType.name, handler as (event: DomainEvent) => void);
    }

    private handle(event: object|DomainEvent, method: string): void {
        const eventName = event.constructor.name;
        const handler = this.eventHandlers.get(eventName);

        if (handler) {
            handler(event as DomainEvent);
            return;
        }

        // If handlers are registered, we're in strict mode - throw if no handler found
        // This prevents silent failures when using the explicit registration pattern
        if (this.eventHandlers.size > 0) {
            throw new Error(`No handler registered for ${eventName}`);
        }

        // Fallback to legacy apply* method pattern for backwards compatibility
        // Only used when NO handlers are registered at all
        if ((this as any)[method]) {
            (this as any)[method](event);
        }
    }

}
