import type DomainMessage from "../../Domain/Event/DomainMessage";
import type DomainEvent from "../../Domain/Event/DomainEvent";
import type IEventListener from "./IEventListener";

export default abstract class EventSubscriber implements IEventListener {
    /**
     * Map of event type names to their handler functions.
     * Subclasses should populate this in their constructor using registerHandler().
     */
    protected readonly handlers: Map<string, (event: DomainEvent) => Promise<void> | void> = new Map();

    /**
     * Registers a handler for a specific event type.
     *
     * @param eventType - The event class constructor
     * @param handler - The handler function to invoke when this event type is received
     *
     * Note: Constructor parameters use `any[]` for variance - this allows
     * registering constructors with any parameter signature.
     *
     * @example
     * ```typescript
     * class MySubscriber extends EventSubscriber {
     *     constructor() {
     *         super();
     *         this.registerHandler(UserCreated, this.onUserCreated.bind(this));
     *     }
     *
     *     private onUserCreated(event: UserCreated): void {
     *         // handle event
     *     }
     * }
     * ```
     */
    protected registerHandler<T extends DomainEvent>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventType: new (...args: any[]) => T,
        handler: (event: T) => Promise<void> | void
    ): void {
        this.handlers.set(eventType.name, handler as (event: DomainEvent) => Promise<void> | void);
    }

    /**
     * Handles incoming domain messages by routing to the appropriate handler.
     *
     * If no handler is registered for the event type and no legacy on{EventType} method exists,
     * the event is silently ignored (subscribers may not handle all events).
     *
     * Backwards compatibility: If no handler is registered via registerHandler(),
     * falls back to looking for an on{EventType} method for legacy support.
     */
    public async on(message: DomainMessage): Promise<void> {
        const handler = this.handlers.get(message.eventType);
        if (handler) {
            await handler(message.event as DomainEvent);
            return;
        }

        // Backwards compatibility: fall back to reflection-based method lookup
        // This allows existing code using on{EventType} methods to continue working
        const method: string = "on" + message.eventType;
        if ((this as any)[method]) {
            await (this as any)[method](message.event);
        }
    }
}
