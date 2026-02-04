import type DomainMessage from "../../Domain/Event/DomainMessage";
import type DomainEvent from "../../Domain/Event/DomainEvent";
import type EventListener from "./EventListener";
import type EventSubscriber from "./EventSubscriber";

/**
 * Constructor type for domain events.
 * Used to register event-specific subscribers.
 *
 * Note: Constructor parameters use `any[]` for variance - this allows
 * accepting constructors with any parameter signature.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DomainEventConstructor<T extends DomainEvent = DomainEvent> = new (...args: any[]) => T;

/**
 * Interface for event buses that publish domain events to subscribers and listeners.
 *
 * Event buses are responsible for dispatching domain events to registered handlers.
 * They support two patterns:
 * - Event-specific subscribers: Handle specific event types
 * - Global listeners: Observe all events
 *
 * Implementations may add additional features like:
 * - Dead letter queues for failed handlers
 * - Idempotency protection
 * - Event replay
 * - Async/sync dispatch strategies
 *
 * @example
 * ```typescript
 * const eventBus: IEventBus = new EventBus();
 *
 * // Attach event-specific subscriber
 * eventBus.attach(UserCreated, new SendWelcomeEmailSubscriber());
 *
 * // Add global listener
 * eventBus.addListener(new AuditLogListener());
 *
 * // Publish event
 * await eventBus.publish(domainMessage);
 * ```
 */
export default interface IEventBus {
    /**
     * Publishes a domain message to all registered subscribers and listeners.
     *
     * @param message - The domain message to publish
     * @returns A promise that resolves when all handlers have completed
     */
    publish(message: DomainMessage): Promise<void>;

    /**
     * Attaches an event subscriber to a specific event type.
     * Multiple subscribers can be attached to the same event type.
     *
     * @param event - The event class constructor
     * @param subscriber - The subscriber that will handle the event
     * @returns The event bus instance for method chaining
     */
    attach(event: DomainEventConstructor, subscriber: EventSubscriber): IEventBus;

    /**
     * Adds a global event listener that receives all published events.
     * Listeners are registered once per instance (duplicates ignored).
     *
     * @param listener - The listener that will observe all events
     * @returns The event bus instance for method chaining
     */
    addListener(listener: EventListener): IEventBus;
}
