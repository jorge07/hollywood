/**
 * Interface for idempotency stores that track processed event keys.
 * Implementations should be thread-safe and support TTL-based expiration.
 */
export default interface IIdempotencyStore {
    /**
     * Check if an idempotency key has already been processed.
     * @param key The idempotency key to check
     * @returns true if the key exists (event was already processed), false otherwise
     */
    exists(key: string): Promise<boolean>;

    /**
     * Mark an idempotency key as processed.
     * @param key The idempotency key to mark
     * @param ttl Optional time-to-live in milliseconds. If not provided, the key persists indefinitely.
     */
    mark(key: string, ttl?: number): Promise<void>;

    /**
     * Remove an idempotency key from the store.
     * Useful for cleanup or when an event processing needs to be retried.
     * @param key The idempotency key to remove
     */
    remove(key: string): Promise<void>;
}
