import type EventStore from "../../EventSourcing/EventStore";
import type IRepository from "./IRepository";
import type EventSourcedAggregateRoot from "../EventSourcedAggregateRoot";
import ConcurrencyException from "../../EventSourcing/Exception/ConcurrencyException";

export type RetryCallback<T extends EventSourcedAggregateRoot> = (aggregate: T) => void | Promise<void>;

export default abstract class Repository<T extends EventSourcedAggregateRoot> implements IRepository<T> {
    constructor(protected readonly eventStore: EventStore<T>) {}

    public async save(aggregateRoot: T): Promise<void> {
        await this.eventStore.save(aggregateRoot);
    }

    public async load(aggregateRootId: string): Promise<T> {
        return this.eventStore.load(aggregateRootId);
    }

    public async saveWithRetry(
        aggregateRootId: string,
        updateFn: RetryCallback<T>,
        maxRetries: number = 3
    ): Promise<void> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const aggregate = await this.load(aggregateRootId);
                await updateFn(aggregate);
                await this.save(aggregate);
                return;
            } catch (error) {
                if (error instanceof ConcurrencyException && attempt < maxRetries) {
                    lastError = error;
                    continue;
                }
                throw error;
            }
        }

        throw lastError;
    }
}
