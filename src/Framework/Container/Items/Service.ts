import type { interfaces } from "inversify";
import type { AggregateFactory } from '../../../EventSourcing/EventStore';

type UniqueServiceIdentifier = string;

export interface IListener {
    bus: string;
    listener?: boolean;
}

export type Subscriber = IListener & {
    subscriber: any[],
};

export interface IService extends Partial<Subscriber> {
    instance?: any;
    collection?: any[];
    custom?: (context: interfaces.Context) => any;
    eventStore?: AggregateFactory<any>;
    async?: () => any;
    constant?: boolean;
    // Will replace any other existing service
    // (Useful on test environments)
    overwrite?: boolean;
}

export type ServiceList = Map<UniqueServiceIdentifier, IService>;
