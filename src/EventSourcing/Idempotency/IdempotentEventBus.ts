import type DomainMessage from "../../Domain/Event/DomainMessage";
import type EventListener from "../EventBus/EventListener";
import type EventSubscriber from "../EventBus/EventSubscriber";
import type IEventBus from "../EventBus/IEventBus";
import type IIdempotencyStore from "./IIdempotencyStore";
import EventBus from "../EventBus/EventBus";

/**
 * Options for configuring the IdempotentEventBus.
 */
export interface IdempotentEventBusOptions {
    /**
     * Time-to-live for idempotency keys in milliseconds.
     * After this time, the same event can be processed again.
     * Default: undefined (keys persist indefinitely)
     */
    ttl?: number;

    /**
     * Callback invoked when a duplicate event is detected.
     * Useful for logging or metrics.
     */
    onDuplicate?: (message: DomainMessage) => void;
}

/**
 * An EventBus wrapper that provides idempotent event publishing.
 * Prevents duplicate event processing at the bus level.
 *
 * This is useful when you want all handlers to receive idempotency protection
 * without wrapping each handler individually.
 */
export default class IdempotentEventBus extends EventBus {
    constructor(
        private readonly idempotencyStore: IIdempotencyStore,
        private readonly options: IdempotentEventBusOptions = {},
    ) {
        super();
    }

    public async publish(message: DomainMessage): Promise<void> {
        const key = message.idempotencyKey;

        // Check if already processed
        const alreadyProcessed = await this.idempotencyStore.exists(key);

        if (alreadyProcessed) {
            if (this.options.onDuplicate) {
                this.options.onDuplicate(message);
            }
            return;
        }

        // Mark as processing before handling to prevent race conditions
        // in concurrent scenarios
        await this.idempotencyStore.mark(key, this.options.ttl);

        try {
            // Delegate to parent EventBus for actual publishing
            await super.publish(message);
        } catch (error) {
            // If publishing fails, remove the key to allow retry
            await this.idempotencyStore.remove(key);
            throw error;
        }
    }

    /**
     * Attach a subscriber to an event type.
     * Overridden to return the correct type.
     */
    public attach(event: any, subscriber: EventSubscriber): IdempotentEventBus {
        super.attach(event, subscriber);
        return this;
    }

    /**
     * Add a global event listener.
     * Overridden to return the correct type.
     */
    public addListener(listener: EventListener): IdempotentEventBus {
        super.addListener(listener);
        return this;
    }
}
