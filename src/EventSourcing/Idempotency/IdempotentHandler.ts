import type DomainMessage from "../../Domain/Event/DomainMessage";
import type IIdempotencyStore from "./IIdempotencyStore";
import type IEventListener from "../EventBus/IEventListener";

/**
 * Options for configuring idempotent handling behavior.
 */
export interface IdempotentHandlerOptions {
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

    /**
     * Callback invoked when an error occurs during handling.
     * If not provided, errors are re-thrown.
     */
    onError?: (error: Error, message: DomainMessage) => void;
}

/**
 * Wraps an event listener/subscriber to provide idempotent event handling.
 * Prevents duplicate processing of events based on their idempotency key.
 */
export default class IdempotentHandler implements IEventListener {
    constructor(
        private readonly innerHandler: IEventListener,
        private readonly idempotencyStore: IIdempotencyStore,
        private readonly options: IdempotentHandlerOptions = {},
    ) {}

    public async on(message: DomainMessage): Promise<void> {
        const key = message.idempotencyKey;

        // Check if already processed
        const alreadyProcessed = await this.idempotencyStore.exists(key);

        if (alreadyProcessed) {
            if (this.options.onDuplicate) {
                this.options.onDuplicate(message);
            }
            return;
        }

        try {
            // Execute the inner handler
            await this.innerHandler.on(message);

            // Mark as processed only after successful handling
            await this.idempotencyStore.mark(key, this.options.ttl);
        } catch (error) {
            if (this.options.onError) {
                this.options.onError(error as Error, message);
            } else {
                throw error;
            }
        }
    }
}

/**
 * Factory function to create an idempotent wrapper for any event listener.
 *
 * @param handler The event listener to wrap
 * @param store The idempotency store to use
 * @param options Optional configuration
 * @returns An idempotent event listener
 *
 * @example
 * ```typescript
 * const store = new InMemoryIdempotencyStore();
 * const myListener = new MyEventListener();
 * const idempotentListener = makeIdempotent(myListener, store, { ttl: 3600000 });
 * eventBus.addListener(idempotentListener);
 * ```
 */
export function makeIdempotent(
    handler: IEventListener,
    store: IIdempotencyStore,
    options?: IdempotentHandlerOptions,
): IdempotentHandler {
    return new IdempotentHandler(handler, store, options);
}
