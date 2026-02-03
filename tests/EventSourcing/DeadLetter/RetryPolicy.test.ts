import "reflect-metadata";

import RetryPolicy from "../../../src/EventSourcing/DeadLetter/RetryPolicy";

describe("RetryPolicy", () => {
    describe("constructor", () => {
        it("should create policy with specified config", () => {
            const policy = new RetryPolicy({
                maxRetries: 5,
                baseDelayMs: 500,
                maxDelayMs: 10000,
            });

            expect(policy.getMaxRetries()).toBe(5);
        });

        it("should use default multiplier when not specified", () => {
            const policy = new RetryPolicy({
                maxRetries: 3,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
            });

            // With default multiplier of 2:
            // retry 0: 1000ms, retry 1: 2000ms, retry 2: 4000ms
            expect(policy.calculateDelay(0)).toBe(1000);
            expect(policy.calculateDelay(1)).toBe(2000);
            expect(policy.calculateDelay(2)).toBe(4000);
        });
    });

    describe("default", () => {
        it("should create a default retry policy", () => {
            const policy = RetryPolicy.default();

            expect(policy.getMaxRetries()).toBe(3);
            // Default has jitter, so we can't predict exact values
            expect(policy.calculateDelay(0)).toBeGreaterThanOrEqual(1000);
            expect(policy.calculateDelay(0)).toBeLessThanOrEqual(1100); // 10% jitter
        });
    });

    describe("noRetry", () => {
        it("should create a policy with no retries", () => {
            const policy = RetryPolicy.noRetry();

            expect(policy.getMaxRetries()).toBe(0);
            expect(policy.isExhausted(0)).toBe(true);
        });
    });

    describe("evaluate", () => {
        it("should allow retry when under max retries", () => {
            const policy = new RetryPolicy({
                maxRetries: 3,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
            });

            const decision = policy.evaluate(0);
            expect(decision.shouldRetry).toBe(true);
            expect(decision.attemptNumber).toBe(1);
            expect(decision.delayMs).toBe(1000);
        });

        it("should not allow retry when max retries reached", () => {
            const policy = new RetryPolicy({
                maxRetries: 3,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
            });

            const decision = policy.evaluate(3);
            expect(decision.shouldRetry).toBe(false);
            expect(decision.attemptNumber).toBe(4);
            expect(decision.delayMs).toBe(0);
        });

        it("should calculate correct delay for each retry attempt", () => {
            const policy = new RetryPolicy({
                maxRetries: 5,
                baseDelayMs: 100,
                maxDelayMs: 10000,
                backoffMultiplier: 2,
            });

            expect(policy.evaluate(0).delayMs).toBe(100);   // 100 * 2^0
            expect(policy.evaluate(1).delayMs).toBe(200);   // 100 * 2^1
            expect(policy.evaluate(2).delayMs).toBe(400);   // 100 * 2^2
            expect(policy.evaluate(3).delayMs).toBe(800);   // 100 * 2^3
            expect(policy.evaluate(4).delayMs).toBe(1600);  // 100 * 2^4
        });
    });

    describe("calculateDelay", () => {
        it("should use exponential backoff", () => {
            const policy = new RetryPolicy({
                maxRetries: 10,
                baseDelayMs: 100,
                maxDelayMs: 100000,
                backoffMultiplier: 2,
            });

            expect(policy.calculateDelay(0)).toBe(100);    // 100 * 2^0
            expect(policy.calculateDelay(1)).toBe(200);    // 100 * 2^1
            expect(policy.calculateDelay(2)).toBe(400);    // 100 * 2^2
            expect(policy.calculateDelay(3)).toBe(800);    // 100 * 2^3
            expect(policy.calculateDelay(4)).toBe(1600);   // 100 * 2^4
        });

        it("should cap delay at maxDelayMs", () => {
            const policy = new RetryPolicy({
                maxRetries: 10,
                baseDelayMs: 1000,
                maxDelayMs: 5000,
                backoffMultiplier: 2,
            });

            expect(policy.calculateDelay(0)).toBe(1000);   // 1000 * 2^0
            expect(policy.calculateDelay(1)).toBe(2000);   // 1000 * 2^1
            expect(policy.calculateDelay(2)).toBe(4000);   // 1000 * 2^2
            expect(policy.calculateDelay(3)).toBe(5000);   // capped at max
            expect(policy.calculateDelay(4)).toBe(5000);   // capped at max
        });

        it("should support custom multiplier", () => {
            const policy = new RetryPolicy({
                maxRetries: 5,
                baseDelayMs: 100,
                maxDelayMs: 100000,
                backoffMultiplier: 3,
            });

            expect(policy.calculateDelay(0)).toBe(100);    // 100 * 3^0
            expect(policy.calculateDelay(1)).toBe(300);    // 100 * 3^1
            expect(policy.calculateDelay(2)).toBe(900);    // 100 * 3^2
            expect(policy.calculateDelay(3)).toBe(2700);   // 100 * 3^3
        });

        it("should apply jitter when configured", () => {
            const policy = new RetryPolicy({
                maxRetries: 5,
                baseDelayMs: 1000,
                maxDelayMs: 100000,
                backoffMultiplier: 2,
                jitterFactor: 0.2, // 20% jitter
            });

            // Run multiple times to verify jitter is applied
            const delays: number[] = [];
            for (let i = 0; i < 10; i++) {
                delays.push(policy.calculateDelay(0));
            }

            // All delays should be between 1000 and 1200 (1000 + 20%)
            for (const delay of delays) {
                expect(delay).toBeGreaterThanOrEqual(1000);
                expect(delay).toBeLessThanOrEqual(1200);
            }
        });
    });

    describe("isExhausted", () => {
        it("should return false when retries remain", () => {
            const policy = new RetryPolicy({
                maxRetries: 3,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
            });

            expect(policy.isExhausted(0)).toBe(false);
            expect(policy.isExhausted(1)).toBe(false);
            expect(policy.isExhausted(2)).toBe(false);
        });

        it("should return true when max retries reached", () => {
            const policy = new RetryPolicy({
                maxRetries: 3,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
            });

            expect(policy.isExhausted(3)).toBe(true);
            expect(policy.isExhausted(4)).toBe(true);
        });
    });

    describe("getMaxRetries", () => {
        it("should return the configured max retries", () => {
            const policy = new RetryPolicy({
                maxRetries: 7,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
            });

            expect(policy.getMaxRetries()).toBe(7);
        });
    });
});
