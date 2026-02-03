import type IIdempotencyStore from "./IIdempotencyStore";

interface IKeyEntry {
    key: string;
    expiresAt?: number;
}

interface IKeyDictionary {
    [key: string]: IKeyEntry;
}

/**
 * In-memory implementation of IIdempotencyStore.
 * Supports TTL-based expiration with automatic cleanup.
 *
 * Note: This implementation is suitable for single-process applications.
 * For distributed systems, use a Redis or database-backed implementation.
 */
export default class InMemoryIdempotencyStore implements IIdempotencyStore {
    private readonly keys: IKeyDictionary = {};
    private cleanupInterval: NodeJS.Timeout | null = null;
    private readonly cleanupIntervalMs: number;

    /**
     * Creates a new InMemoryIdempotencyStore.
     * @param cleanupIntervalMs Interval for automatic cleanup of expired keys (default: 60000ms = 1 minute)
     */
    constructor(cleanupIntervalMs: number = 60000) {
        this.cleanupIntervalMs = cleanupIntervalMs;
        this.startCleanup();
    }

    public async exists(key: string): Promise<boolean> {
        const entry = this.keys[key];

        if (!entry) {
            return false;
        }

        // Check if entry has expired
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            delete this.keys[key];
            return false;
        }

        return true;
    }

    public async mark(key: string, ttl?: number): Promise<void> {
        const entry: IKeyEntry = {
            key,
            expiresAt: ttl ? Date.now() + ttl : undefined,
        };

        this.keys[key] = entry;
    }

    public async remove(key: string): Promise<void> {
        delete this.keys[key];
    }

    /**
     * Manually trigger cleanup of expired keys.
     * @returns The number of keys removed
     */
    public cleanup(): number {
        const now = Date.now();
        let removedCount = 0;

        for (const key in this.keys) {
            if (this.keys.hasOwnProperty(key)) {
                const entry = this.keys[key];
                if (entry.expiresAt && entry.expiresAt < now) {
                    delete this.keys[key];
                    removedCount++;
                }
            }
        }

        return removedCount;
    }

    /**
     * Get the current number of stored keys.
     */
    public size(): number {
        return Object.keys(this.keys).length;
    }

    /**
     * Clear all stored keys.
     */
    public clear(): void {
        for (const key in this.keys) {
            if (this.keys.hasOwnProperty(key)) {
                delete this.keys[key];
            }
        }
    }

    /**
     * Stop the automatic cleanup interval.
     * Should be called when the store is no longer needed to prevent memory leaks.
     */
    public stopCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    private startCleanup(): void {
        if (this.cleanupIntervalMs > 0) {
            this.cleanupInterval = setInterval(() => {
                this.cleanup();
            }, this.cleanupIntervalMs);

            // Allow the process to exit even if interval is running
            if (this.cleanupInterval.unref) {
                this.cleanupInterval.unref();
            }
        }
    }
}
