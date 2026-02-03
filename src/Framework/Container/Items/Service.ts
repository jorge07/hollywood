import type { interfaces } from "inversify";
import type { AggregateFactory } from '../../../EventSourcing/EventStore';
import type EventSourcedAggregateRoot from '../../../Domain/EventSourcedAggregateRoot';

type UniqueServiceIdentifier = string;

/**
 * Listener configuration for event bus subscriptions.
 */
export interface IListener {
    bus: string;
    listener?: boolean;
}

/**
 * Constructor type for injectable classes.
 * Compatible with inversify's Newable type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = unknown> = new (...args: any[]) => T;

/**
 * Subscriber configuration extending listener with event subscriptions.
 */
export type Subscriber = IListener & {
    subscriber: Constructor[];
};

/**
 * Service configuration interface with typed properties.
 * Each service should have exactly one of: instance, collection, custom, eventStore, or async.
 *
 * @typeParam TCustom - Type returned by the custom factory function
 * @typeParam TAsync - Type returned by the async factory function
 * @typeParam TAggregate - EventSourcedAggregateRoot type for eventStore
 */
export interface IService<
    TCustom = unknown,
    TAsync = unknown,
    TAggregate extends EventSourcedAggregateRoot = EventSourcedAggregateRoot
> extends Partial<Subscriber> {
    /** Class constructor to be instantiated as a singleton */
    instance?: Constructor;
    /** Array of class constructors bound to the same identifier */
    collection?: Constructor[];
    /** Factory function for dynamic value creation */
    custom?: (context: interfaces.Context) => TCustom;
    /** Aggregate factory for creating EventStore instances */
    eventStore?: AggregateFactory<TAggregate>;
    /** Async factory function for service creation */
    async?: () => Promise<TAsync>;
    /** Whether to bind as a constant value */
    constant?: boolean;
    /** Will replace any other existing service (Useful on test environments) */
    overwrite?: boolean;
}

export type ServiceList = Map<UniqueServiceIdentifier, IService>;
