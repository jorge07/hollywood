import type { DeadLetterMessage } from "./DeadLetterMessage";

/**
 * Interface for dead letter queue implementations.
 * Provides operations for managing failed messages.
 */
export default interface IDeadLetterQueue {
    /**
     * Add a failed message to the dead letter queue
     * @param message The dead letter message to add
     */
    add(message: DeadLetterMessage): Promise<void>;

    /**
     * Retrieve a message by its ID
     * @param messageId The unique identifier of the message
     * @returns The dead letter message or undefined if not found
     */
    get(messageId: string): Promise<DeadLetterMessage | undefined>;

    /**
     * Retrieve all messages from the dead letter queue
     * @returns Array of all dead letter messages
     */
    getAll(): Promise<DeadLetterMessage[]>;

    /**
     * Remove a message from the dead letter queue
     * @param messageId The unique identifier of the message to remove
     */
    remove(messageId: string): Promise<void>;

    /**
     * Update a message in the dead letter queue (e.g., after retry attempt)
     * @param message The updated dead letter message
     */
    update(message: DeadLetterMessage): Promise<void>;

    /**
     * Get the count of messages in the dead letter queue
     * @returns Number of messages in the queue
     */
    count(): Promise<number>;

    /**
     * Clear all messages from the dead letter queue
     */
    clear(): Promise<void>;
}
