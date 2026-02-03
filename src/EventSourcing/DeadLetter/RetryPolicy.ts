/**
 * Configuration options for the retry policy
 */
export interface RetryPolicyConfig {
    /** Maximum number of retry attempts before giving up */
    maxRetries: number;
    /** Base delay in milliseconds for exponential backoff */
    baseDelayMs: number;
    /** Maximum delay in milliseconds (caps the exponential growth) */
    maxDelayMs: number;
    /** Multiplier for exponential backoff (default: 2) */
    backoffMultiplier?: number;
    /** Optional jitter factor (0-1) to add randomness to delays */
    jitterFactor?: number;
}

/**
 * Result of a retry policy evaluation
 */
export interface RetryDecision {
    /** Whether a retry should be attempted */
    shouldRetry: boolean;
    /** Delay in milliseconds before the next retry (0 if shouldRetry is false) */
    delayMs: number;
    /** The retry attempt number (0-indexed) */
    attemptNumber: number;
}

/**
 * Retry policy with exponential backoff support.
 * Determines whether and when to retry failed operations.
 */
export default class RetryPolicy {
    private readonly config: Required<RetryPolicyConfig>;

    constructor(config: RetryPolicyConfig) {
        this.config = {
            maxRetries: config.maxRetries,
            baseDelayMs: config.baseDelayMs,
            maxDelayMs: config.maxDelayMs,
            backoffMultiplier: config.backoffMultiplier ?? 2,
            jitterFactor: config.jitterFactor ?? 0,
        };
    }

    /**
     * Create a retry policy with default configuration
     */
    public static default(): RetryPolicy {
        return new RetryPolicy({
            maxRetries: 3,
            baseDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
            jitterFactor: 0.1,
        });
    }

    /**
     * Create a retry policy with no retries (fail immediately)
     */
    public static noRetry(): RetryPolicy {
        return new RetryPolicy({
            maxRetries: 0,
            baseDelayMs: 0,
            maxDelayMs: 0,
        });
    }

    /**
     * Evaluate whether a retry should be attempted based on the current retry count
     * @param currentRetryCount The number of retries already attempted
     * @returns A RetryDecision indicating whether to retry and how long to wait
     */
    public evaluate(currentRetryCount: number): RetryDecision {
        const attemptNumber = currentRetryCount + 1;

        if (currentRetryCount >= this.config.maxRetries) {
            return {
                shouldRetry: false,
                delayMs: 0,
                attemptNumber,
            };
        }

        const delayMs = this.calculateDelay(currentRetryCount);

        return {
            shouldRetry: true,
            delayMs,
            attemptNumber,
        };
    }

    /**
     * Calculate the delay for a given retry attempt using exponential backoff
     * @param retryCount The current retry count (0-indexed)
     * @returns Delay in milliseconds
     */
    public calculateDelay(retryCount: number): number {
        // Exponential backoff: baseDelay * (multiplier ^ retryCount)
        const exponentialDelay = this.config.baseDelayMs *
            Math.pow(this.config.backoffMultiplier, retryCount);

        // Cap at maximum delay
        const cappedDelay = Math.min(exponentialDelay, this.config.maxDelayMs);

        // Apply jitter if configured
        if (this.config.jitterFactor > 0) {
            const jitter = cappedDelay * this.config.jitterFactor * Math.random();
            return Math.floor(cappedDelay + jitter);
        }

        return Math.floor(cappedDelay);
    }

    /**
     * Get the maximum number of retries allowed
     */
    public getMaxRetries(): number {
        return this.config.maxRetries;
    }

    /**
     * Check if retries are exhausted
     * @param retryCount The current retry count
     * @returns True if no more retries are allowed
     */
    public isExhausted(retryCount: number): boolean {
        return retryCount >= this.config.maxRetries;
    }
}
