import type DomainMessage from "../../Domain/Event/DomainMessage";
import type EventListener from "../EventBus/EventListener";
import type EventSubscriber from "../EventBus/EventSubscriber";
import type IEventBus from "../EventBus/IEventBus";
import type { DomainEventConstructor } from "../EventBus/IEventBus";
import type IDeadLetterQueue from "./IDeadLetterQueue";
import { createDeadLetterMessage } from "./DeadLetterMessage";
import type RetryPolicy from "./RetryPolicy";

/**
 * Generates a unique ID for dead letter messages
 */
function generateId(): string {
    return `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

interface ISubscriberRegistry {
    [key: string]: EventSubscriber[];
}

interface IListenersRegistry {
    [key: string]: EventListener;
}

/**
 * An EventBus implementation that catches handler failures and sends them to a dead letter queue.
 * Supports retry policies for automatic retry attempts before moving to DLQ.
 *
 * This class does not extend EventBus to avoid private property conflicts;
 * instead, it implements the IEventBus interface with DLQ support.
 */
export default class DeadLetterAwareEventBus implements IEventBus {
    private readonly subscribersRegistry: ISubscriberRegistry = {};
    private readonly listenersRegistry: IListenersRegistry = {};

    constructor(
        private readonly deadLetterQueue: IDeadLetterQueue,
        private readonly retryPolicy?: RetryPolicy,
    ) {}

    public async publish(message: DomainMessage): Promise<void> {
        const subscribers = this.subscribersFor(message.eventType);
        for (const key in subscribers) {
            if (subscribers.hasOwnProperty(key)) {
                await this.safeExecute(
                    () => subscribers[key].on(message),
                    message,
                    subscribers[key].constructor.name
                );
            }
        }

        const listeners = Object.keys(this.listenersRegistry);
        for (const key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                const listener = this.listenersRegistry[listeners[key]];
                await this.safeExecute(
                    () => listener.on(message),
                    message,
                    listener.constructor.name
                );
            }
        }
    }

    public attach(event: DomainEventConstructor, subscriber: EventSubscriber): DeadLetterAwareEventBus {
        const eventName = event.name;
        const collection = this.subscribersRegistry[eventName] || [];

        collection.push(subscriber);

        this.subscribersRegistry[eventName] = collection;

        return this;
    }

    public addListener(listener: EventListener): DeadLetterAwareEventBus {
        if (!this.listenersRegistry[listener.constructor.name]) {
            this.listenersRegistry[listener.constructor.name] = listener;
        }

        return this;
    }

    /**
     * Retry a failed message from the dead letter queue
     * @param messageId The ID of the message to retry
     * @param handler The handler function to use for retry
     * @returns True if retry was successful, false otherwise
     */
    public async retry(
        messageId: string,
        handler: (message: DomainMessage) => Promise<void> | void
    ): Promise<boolean> {
        const deadLetterMessage = await this.deadLetterQueue.get(messageId);
        if (!deadLetterMessage) {
            throw new Error(`Message with id ${messageId} not found in dead letter queue`);
        }

        try {
            await handler(deadLetterMessage.originalMessage);
            await this.deadLetterQueue.remove(messageId);
            return true;
        } catch (error) {
            const updatedMessage = createDeadLetterMessage(
                deadLetterMessage.id,
                deadLetterMessage.originalMessage,
                error instanceof Error ? error : new Error(String(error)),
                deadLetterMessage.handlerName,
                deadLetterMessage.retryCount + 1,
                new Date()
            );
            await this.deadLetterQueue.update(updatedMessage);
            return false;
        }
    }

    /**
     * Get the dead letter queue instance
     */
    public getDeadLetterQueue(): IDeadLetterQueue {
        return this.deadLetterQueue;
    }

    /**
     * Safely execute a handler, catching errors and sending failures to the DLQ
     */
    private async safeExecute(
        handler: () => Promise<void> | void,
        message: DomainMessage,
        handlerName: string,
        retryCount: number = 0
    ): Promise<void> {
        try {
            await handler();
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            // Check retry policy
            if (this.retryPolicy) {
                const decision = this.retryPolicy.evaluate(retryCount);
                if (decision.shouldRetry) {
                    // Wait for the delay and retry
                    await this.delay(decision.delayMs);
                    return this.safeExecute(handler, message, handlerName, retryCount + 1);
                }
            }

            // Retries exhausted or no retry policy, send to DLQ
            const deadLetterMessage = createDeadLetterMessage(
                generateId(),
                message,
                err,
                handlerName,
                retryCount
            );
            await this.deadLetterQueue.add(deadLetterMessage);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private subscribersFor(eventType: string): EventSubscriber[] {
        return this.subscribersRegistry[eventType] || [];
    }
}
