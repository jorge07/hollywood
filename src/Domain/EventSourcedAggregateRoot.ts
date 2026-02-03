
import type IEventSourced from "./IEventSourced";
import DomainMessage from "./Event/DomainMessage";
import DomainEventStream from "./Event/DomainEventStream";
import EventSourced from "./EventSourced";
import type DomainEvent from "./Event/DomainEvent";
import AggregateRoot from "./AggregateRoot";

export default abstract class EventSourcedAggregateRoot extends AggregateRoot implements IEventSourced {

    protected eventHandlers = new Map<string, (event: DomainEvent) => void>();
    private playhead: number = -1;
    private events: DomainMessage[] = [];
    private children: EventSourced[] = [];

    public getUncommittedEvents(): DomainEventStream {
        const stream = new DomainEventStream(this.events);
        this.events = [];

        return stream;
    }

    public fromHistory(stream: DomainEventStream): any {
        stream.events.forEach(
            (message: DomainMessage) => {
                this.playhead++;
                this.recursiveHandling(message.event, message.eventType);
            },
        );

        return this;
    }

    /**
     * Restores aggregate state from a snapshot.
     *
     * Uses a safe rehydration pattern instead of Object.assign to:
     * - Preserve class prototypes and methods
     * - Avoid overwriting critical infrastructure (event handlers)
     * - Only copy data properties, not methods
     * - Maintain proper child entity relationships
     *
     * @param snapshot - Snapshot data to restore from
     * @returns This aggregate with restored state
     */
    public fromSnapshot(snapshot: any): EventSourcedAggregateRoot {
        // Extract children before copying properties
        const children = snapshot.children || [];

        // Preserve infrastructure that shouldn't be in snapshots
        const handlers = this.eventHandlers;

        // Copy only data properties (not methods or special properties)
        // This preserves the prototype chain and class methods
        for (const key in snapshot) {
            if (snapshot.hasOwnProperty(key) && key !== 'children' && key !== 'eventHandlers') {
                // Only copy if it's a data property (not a method)
                const descriptor = Object.getOwnPropertyDescriptor(snapshot, key);
                if (descriptor && typeof descriptor.value !== 'function') {
                    (this as any)[key] = snapshot[key];
                }
            }
        }

        // Restore infrastructure
        this.eventHandlers = handlers;

        // Recursively restore child entities
        this.children.forEach((child: EventSourced, key: number) => {
            if (children[key]) {
                child.fromSnapshot(children[key]);
            }
        });

        return this;
    }

    public recursiveHandling(event: DomainEvent, eventType?: string): void {
        this.handle(event, eventType);

        this.getChildEntities().forEach((aggregate: EventSourced) => {
            aggregate.recursiveHandling(event, eventType);
        });
    }

    public version(): number {

        return this.playhead;
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

    /**
     * Ensures that a condition is true. Throws an error if the condition is false.
     * Use this method to validate business invariants before raising events.
     *
     * @param condition - The condition to check
     * @param errorMessage - The error message to throw if the condition is false
     * @throws {Error} When the condition is false
     *
     * @example
     * ```typescript
     * class BankAccount extends EventSourcedAggregateRoot {
     *     withdraw(amount: number): void {
     *         this.ensure(
     *             this.balance >= amount,
     *             `Insufficient funds: balance is ${this.balance}, attempted to withdraw ${amount}`
     *         );
     *         this.raise(new MoneyWithdrawn(amount));
     *     }
     * }
     * ```
     */
    protected ensure(condition: boolean, errorMessage: string): void {
        if (!condition) {
            throw new Error(errorMessage);
        }
    }

    /**
     * Ensures that a value is not null or undefined.
     * Use this method to validate required parameters or state.
     *
     * @param value - The value to check
     * @param errorMessage - The error message to throw if the value is null/undefined
     * @throws {Error} When the value is null or undefined
     *
     * @example
     * ```typescript
     * class Order extends EventSourcedAggregateRoot {
     *     addItem(productId: string, quantity: number): void {
     *         this.ensureNotNull(productId, 'Product ID is required');
     *         this.ensureNotNull(quantity, 'Quantity is required');
     *         this.ensure(quantity > 0, 'Quantity must be positive');
     *         this.raise(new ItemAdded(productId, quantity));
     *     }
     * }
     * ```
     */
    protected ensureNotNull<T>(value: T | null | undefined, errorMessage: string): asserts value is T {
        if (value === null || value === undefined) {
            throw new Error(errorMessage);
        }
    }

    /**
     * Raises a domain event and applies it to the aggregate's state.
     * This is the primary way to record state changes in event-sourced aggregates.
     *
     * The event will be:
     * 1. Applied to this aggregate and all child entities
     * 2. Stored in the uncommitted events list
     * 3. Published to the event bus when the aggregate is saved
     *
     * @param event - The domain event to raise (must implement DomainEvent)
     *
     * @example
     * ```typescript
     * class Order extends EventSourcedAggregateRoot {
     *     placeOrder(items: OrderItem[]): void {
     *         this.ensure(items.length > 0, 'Order must have at least one item');
     *         this.raise(new OrderPlaced(this.getAggregateRootId(), items));
     *     }
     * }
     * ```
     */
    protected raise(event: DomainEvent): void {
        const domainMessage: DomainMessage = DomainMessage.create(
            this.getAggregateRootId().toString(),
            this.playhead,
            event,
        );

        this.recursiveHandling(event);

        this.playhead++;

        this.events.push(domainMessage);
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
