import type DomainMessage from "../../Domain/Event/DomainMessage";

/**
 * Represents a failed message that has been moved to the dead letter queue.
 * Contains the original message, error details, and retry metadata.
 */
export interface DeadLetterMessage {
    /** Unique identifier for this dead letter entry */
    readonly id: string;
    /** The original domain message that failed to process */
    readonly originalMessage: DomainMessage;
    /** The error that caused the failure */
    readonly error: Error;
    /** Timestamp when the failure occurred */
    readonly failedAt: Date;
    /** Number of times this message has been retried */
    readonly retryCount: number;
    /** Name of the handler that failed to process the message */
    readonly handlerName: string;
}

/**
 * Factory function to create a new DeadLetterMessage
 */
export function createDeadLetterMessage(
    id: string,
    originalMessage: DomainMessage,
    error: Error,
    handlerName: string,
    retryCount: number = 0,
    failedAt: Date = new Date()
): DeadLetterMessage {
    return {
        id,
        originalMessage,
        error,
        failedAt,
        retryCount,
        handlerName,
    };
}
