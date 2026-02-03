import type { DeadLetterMessage } from "./DeadLetterMessage";
import type IDeadLetterQueue from "./IDeadLetterQueue";

/**
 * In-memory implementation of the dead letter queue.
 * Suitable for development and testing purposes.
 */
export default class InMemoryDeadLetterQueue implements IDeadLetterQueue {
    private readonly messages: Map<string, DeadLetterMessage> = new Map();

    public async add(message: DeadLetterMessage): Promise<void> {
        this.messages.set(message.id, message);
    }

    public async get(messageId: string): Promise<DeadLetterMessage | undefined> {
        return this.messages.get(messageId);
    }

    public async getAll(): Promise<DeadLetterMessage[]> {
        return Array.from(this.messages.values());
    }

    public async remove(messageId: string): Promise<void> {
        this.messages.delete(messageId);
    }

    public async update(message: DeadLetterMessage): Promise<void> {
        if (!this.messages.has(message.id)) {
            throw new Error(`Message with id ${message.id} not found in dead letter queue`);
        }
        this.messages.set(message.id, message);
    }

    public async count(): Promise<number> {
        return this.messages.size;
    }

    public async clear(): Promise<void> {
        this.messages.clear();
    }
}
